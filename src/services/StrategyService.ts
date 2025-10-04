import axios from "axios";
import { IStrategyService } from "../interfaces/IApiService";
import { IStopLossService } from "./StopLossService";
import { WebSocketServer } from "./WebSocketServer";
import { TradingStrategyRepository } from "../repositories/TradingRepository";
import { TechnicalService } from "./TechnicalService";
import { PriceService } from "./PriceService";
// Strategy Service - Open/Closed Principle: Easy to extend with new strategies
export class StrategyService implements IStrategyService {
  private strategies: {
    [key: string]: {
      strategy: string;
      timeframe: string;
      interval: number;
      lastUpdate: number;
    };
  } = {
  };
  private strategyRepository: TradingStrategyRepository;
  private webSocketServer?: WebSocketServer;
  // private technicalService: TechnicalService;
  

  constructor(
    private stopLossService: IStopLossService,
    private priceService: PriceService,
    private technicalService: TechnicalService
  ) {
    this.strategyRepository = new TradingStrategyRepository();
    this.technicalService = technicalService;
    this.priceService = priceService;
    this.loadStrategies();
  }

  async loadStrategies(): Promise<void> {
    const strategies = await this.strategyRepository.findAllActive();
    strategies.forEach((strategy) => {
      this.strategies[strategy.symbol] = {
        strategy: strategy.strategy,
        timeframe: strategy.timeframe,
        interval: this.timeframeToMs(strategy.timeframe),
        lastUpdate: strategy.lastUpdate.getTime(),
      };
    });
  }

  setWebSocketServer(webSocketServer: WebSocketServer): void {
    this.webSocketServer = webSocketServer;
  }

  addStrategyStopLoss(
    symbol: string,
    strategy: string,
    timeframe: string
  ): void {
    const interval = this.timeframeToMs(timeframe);
    this.strategies[symbol] = { strategy, timeframe, interval, lastUpdate: 0 };
    this.updateStopLoss(symbol);
    this.strategyRepository.addStrategy({
      symbol,
      strategy,
      timeframe,
      isActive: true,
    });
  }

  removeStrategyStopLoss(symbol: string): void {
    delete this.strategies[symbol];
    this.strategyRepository.removeStrategy(symbol);
  }

  deactivateStrategyStopLoss(strategyId: string): void {
    this.strategyRepository.deactivate(strategyId);
  }

  getAllStrategies(): any {
    const keys = Object.keys(this.strategies);
    // console.log("🔍 Keys:", keys);
    const strategies = keys.map((key) => ({
      symbol: key,
      stopLossPrice: this.stopLossService.getStopLoss(key),
      ...this.strategies[key],
    }));
    return strategies;
  }

  async updateStopLoss(symbol: string): Promise<void> {
    const config = this.strategies[symbol];
    if (!config) return;

    try {
      const candles = await this.priceService.fetchCandles(symbol, config.timeframe, 1000); // Get more candles for better analysis
      let newSL: number | undefined;
      // console.log("🔍 Candles:", candles.slice(-2));
      if (config.strategy === "last_support") {
        newSL = this.technicalService.findLastSupport(candles);
      } else if (config.strategy === "last_close") {
        newSL = parseFloat(candles[candles.length - 2].low);
      } else if (config.strategy === "moving_average") {
        newSL = this.technicalService.calculateMovingAverageSupport(candles);
      } else if (config.strategy === "fibonacci") {
        newSL = this.technicalService.calculateFibonacciSupport(candles);
      } else if (config.strategy === "pivot_points") {
        newSL = this.technicalService.calculatePivotPointSupport(candles);
      }

      if (newSL && newSL !== this.stopLossService.getStopLoss(symbol)) {
        this.stopLossService.setStopLoss(symbol, newSL);
        const currentPrice = parseFloat(candles[candles.length - 1].close);
        const distance = (
          ((currentPrice - newSL) / currentPrice) *
          100
        ).toFixed(2);
        console.log(
          `🔄 Updated SL for ${symbol} (${config.strategy} ${config.timeframe}) = $${newSL} (${distance}% below current price $${currentPrice})`
        );

        // Send WebSocket notification to frontend
        if (this.webSocketServer) {
          this.webSocketServer.sendStrategyAlert(
            `${config.strategy} ${config.timeframe} on ${symbol}`,
            { strategy: config.strategy, symbol, stopLossPrice: newSL }
          );
        }
      }
    } catch (err: any) {
      console.error("SL update failed:", err.message);
    }
  }

  private timeframeToMs(tf: string): number {
    const map = {
      "1m": 60000,
      "5m": 300000,
      "15m": 900000,
      "1h": 3600000,
      "4h": 14400000,
      "1d": 86400000,
    };
    return map[tf as keyof typeof map] || 300000; // default 5m
  }

  private async fetchCandles(
    symbol: string,
    interval = "1h",
    limit = 1000
  ): Promise<any[]> {
    const url = "https://fapi.binance.com/fapi/v1/klines";
    const response = await axios.get(url, {
      params: { symbol: symbol.toUpperCase(), interval, limit },
    });

    return response.data.map((c: any) => ({
      openTime: c[0],
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5]),
      closeTime: c[6],
    }));
  }

  // Start periodic updates
  startPeriodicUpdates(): void {
    Object.keys(this.strategies).forEach((symbol) => {
      this.updateStopLoss(symbol);
    });

    setInterval(() => {
      Object.keys(this.strategies).forEach((symbol) => {
        this.updateStopLoss(symbol);
      });
    }, 5 * 60000); // check every 5m
  }
}
