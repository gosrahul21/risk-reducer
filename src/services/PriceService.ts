import { IPriceData } from "../models/TradingData";

// Price Service - Single Responsibility: Manage price data with persistence
export class PriceService {
  private latestPrices: { [key: string]: number } = {};

  constructor() {

  }

  async updatePrice(
    symbol: string,
    price: number,
    volume?: number,
    change24h?: number
  ): Promise<void> {
    try {
      // Update in-memory cache
      this.latestPrices[symbol] = price;

      // Persist to database
      const priceData: Partial<IPriceData> = {
        symbol,
        price,
        timestamp: new Date(),
        source: "binance",
      };

      if (volume !== undefined) {
        priceData.volume = volume;
      }

      if (change24h !== undefined) {
        priceData.change24h = change24h;
      }

    } catch (error) {
      console.error("❌ Failed to update price:", error);
    }
  }

  getPrice(symbol: string): number | undefined {
    return this.latestPrices[symbol];
  }

  getAllPrices(): { [key: string]: number } {
    return { ...this.latestPrices };
  }

  // async getPriceHistory(
  //   symbol: string,
  //   limit: number = 100
  // ): Promise<IPriceData[]> {
  //   return await this.priceDataRepository.getHistory(symbol, limit);
  // }

  // async getPriceRange(
  //   symbol: string,
  //   startDate: Date,
  //   endDate: Date
  // ): Promise<IPriceData[]> {
  //   return await this.priceDataRepository.getPriceRange(
  //     symbol,
  //     startDate,
  //     endDate
  //   );
  // }

  // async getLatestPriceData(symbol: string): Promise<IPriceData | null> {
  //   return await this.priceDataRepository.getLatest(symbol);
  // }
}
