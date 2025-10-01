import { StopLossRepository } from "../repositories/TradingRepository";
import { IStopLoss } from "../models/TradingData";
import { WebSocketServer } from "./WebSocketServer";

// Stop Loss Service - Single Responsibility: Manage stop loss levels with persistence
export interface IStopLossService {
  setStopLoss(
    symbol: string,
    price: number,
    strategy?: string,
    timeframe?: string
  ): Promise<void>;
  getStopLoss(symbol: string): number | undefined;
  removeStopLoss(symbol: string): Promise<void>;
  getAllStopLosses(): { symbol: string; price: number }[];
  checkStopLoss(symbol: string, currentPrice: number): boolean;
  triggerStopLoss(symbol: string, currentPrice: number): Promise<void>;
  getStopLossHistory(symbol?: string, limit?: number): Promise<IStopLoss[]>;
}

export class StopLossService implements IStopLossService {
  private stopLossLevels: { [key: string]: number } = {};
  private stopLossRepository: StopLossRepository;
  private webSocketServer?: WebSocketServer;

  constructor() {
    this.stopLossRepository = new StopLossRepository();
    this.loadActiveStopLosses();
  }

  setWebSocketServer(webSocketServer: WebSocketServer): void {
    this.webSocketServer = webSocketServer;
  }

  private async loadActiveStopLosses(): Promise<void> {
    try {
      const activeStopLosses = await this.stopLossRepository.findAllActive();
      activeStopLosses.forEach((stopLoss) => {
        this.stopLossLevels[stopLoss.symbol] = stopLoss.price;
      });
      console.log(
        `📊 Loaded ${activeStopLosses.length} active stop losses from database`
      );
    } catch (error) {
      console.error("❌ Failed to load stop losses from database:", error);
    }
  }

  async setStopLoss(
    symbol: string,
    price: number,
    strategy?: string,
    timeframe?: string
  ): Promise<void> {
    try {
      // Update in-memory cache
      this.stopLossLevels[symbol] = parseFloat(price.toString());

      // Persist to database
      const stopLossData: Partial<IStopLoss> = {
        symbol,
        price: parseFloat(price.toString()),
        strategy: strategy || "manual",
        isActive: true,
      };

      if (timeframe) {
        stopLossData.timeframe = timeframe;
      }

      // Check if stop loss already exists for this symbol
      const existingStopLoss = await this.stopLossRepository.findBySymbol(
        symbol
      );

      if (existingStopLoss) {
        await this.stopLossRepository.update(symbol, stopLossData);
        console.log(`🔄 Updated stop loss for ${symbol} at $${price}`);
      } else {
        await this.stopLossRepository.create(stopLossData);
        console.log(`🛡️ Stop loss set for ${symbol} at $${price}`);
      }
    } catch (error) {
      console.error("❌ Failed to set stop loss:", error);
      // Remove from cache if database operation failed
      delete this.stopLossLevels[symbol];
      throw error;
    }
  }

  getStopLoss(symbol: string): number | undefined {
    return this.stopLossLevels[symbol];
  }

  async removeStopLoss(symbol: string): Promise<void> {
    try {
      // Remove from in-memory cache
      delete this.stopLossLevels[symbol];

      // Deactivate in database
      await this.stopLossRepository.deactivate(symbol);
      console.log(`🗑️ Stop loss removed for ${symbol}`);
    } catch (error) {
      console.error("❌ Failed to remove stop loss:", error);
      throw error;
    }
  }

  getAllStopLosses(): { symbol: string; price: number }[] {
    return Object.keys(this.stopLossLevels).map((key) => ({
      symbol: key,
      price: this.stopLossLevels[key],
    })) as { symbol: string; price: number }[];
  }

  checkStopLoss(symbol: string, currentPrice: number): boolean {
    const stopLoss = this.stopLossLevels[symbol];
    // console.log("🔍 Stop loss:", stopLoss, "Current price:", currentPrice, "Stop loss <= current price:", currentPrice <= stopLoss! );
    return stopLoss ? currentPrice <= stopLoss : false;
  }

  async triggerStopLoss(symbol: string, currentPrice: number): Promise<void> {
    try {
      // Get the stop loss price before removing it
      const stopLossPrice = this.stopLossLevels[symbol];

      // Trigger in database
      await this.stopLossRepository.trigger(symbol, currentPrice);

      // Remove from in-memory cache
      delete this.stopLossLevels[symbol];

      // Send WebSocket notification to frontend
      if (this.webSocketServer && stopLossPrice) {
        this.webSocketServer.sendStopLossTriggered(
          symbol,
          currentPrice,
          stopLossPrice
        );
      }

      console.log(`🚨 Stop loss triggered for ${symbol} at $${currentPrice}`);
    } catch (error) {
      console.error("❌ Failed to trigger stop loss:", error);
      throw error;
    }
  }

  async getStopLossHistory(
    symbol?: string,
    limit: number = 100
  ): Promise<IStopLoss[]> {
    return await this.stopLossRepository.getHistory(symbol, limit);
  }
}
