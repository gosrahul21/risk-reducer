import axios from "axios";
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

  public async fetchCandles(
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
