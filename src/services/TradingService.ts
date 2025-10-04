import { IApiService } from "../interfaces/IApiService";
import { IStopLossService } from "./StopLossService";
import { PriceService } from "./PriceService";
import { StrategyService } from "./StrategyService";
import { getBinanceSymbolToCoindcx } from "../utils/symbol";

// Trading Service - Single Responsibility: Handle trading logic
export class TradingService {
  constructor(
    private apiService: IApiService,
    private stopLossService: IStopLossService,
    private priceService: PriceService,
    private strategyService: StrategyService
  ) {}

  async handleStopLossTrigger(
    symbol: string,
    currentPrice: number
  ): Promise<void> {
    if (!this.stopLossService.checkStopLoss(symbol, currentPrice)) {
      return;
    }

    console.log(
      `handling🚨 STOP LOSS TRIGGERED for ${symbol} at ${currentPrice} ${this.stopLossService.checkStopLoss(
        symbol,
        currentPrice
      )}`
    );
    // await this.stopLossService.triggerStopLoss(symbol, currentPrice); // clear SL and log trigger
    // await this.strategyService.removeStrategyStopLoss(symbol);
    try {
    //   // Get position size from API
       symbol = getBinanceSymbolToCoindcx(symbol)
      const positions = await this.apiService.getPositions(symbol);
      console.log("🔍 Positions:", positions);
      const filteredPositions = positions.filter(
        (p: any) => p.pair === `B-${symbol}` || p.pair === symbol
      );
      filteredPositions.forEach(async (position: any) => {
        const quantity = position
          ? parseFloat(position.active_pos.toString())
          : 0.001; // fallback

        if (quantity > 0) {
          await this.placeMarketSell(position.pair, quantity,position.margin_currency_short_name);
          await this.stopLossService.triggerStopLoss(symbol, currentPrice,); // clear SL and log trigger
          await this.strategyService.removeStrategyStopLoss(symbol);
          console.log(
            `✅ Market sell executed for ${symbol}, quantity: ${quantity}`
          );
        }
      });
    } catch (err: any) {
      console.error("❌ Stop loss execution failed:", err.message);
    }
  }

  private async placeMarketSell(
    symbol: string,
    quantity: number,
    margin_currency_short_name: string = 'USDT'
  ): Promise<any> {
    try {
      const orderData = {
        side: "sell",
        pair: symbol,
        order_type: "market_order",
        total_quantity: quantity,
        leverage: 1,
        margin_currency_short_name: margin_currency_short_name,
      };

      const result = await this.apiService.createOrder(orderData);
      console.log(`✅ Market Sell placed for ${symbol}`, result);
      return result;
    } catch (err: any) {
      console.error(
        "❌ Market Sell Failed:",
        err.response?.data || err.message
      );
      throw err;
    }
  }
}
