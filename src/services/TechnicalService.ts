import { ApiService } from "./ApiService";
import { PriceService } from "./PriceService";

export class TechnicalService {
  private cache: {
    [key: string]: {
      [timeframe: string]: number[];
    };
  } = {};
  constructor(private priceService: PriceService) {
    this.priceService = priceService;
  }

  public findLastSupport(candles: any[]): number | undefined {
    if (candles.length < 5) return undefined;

    // Convert candles to price data
    const priceData = candles.map((candle, index) => ({
      index,
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      open: parseFloat(candle.open),
      volume: parseFloat(candle.volume),
    }));

    // Find local minima (support levels) with improved detection
    const supportLevels = this.findLocalMinima(priceData);

    if (supportLevels.length === 0) {
      // Fallback: find the lowest low in recent candles
      const recentLows = priceData.slice(-10).map((c) => c.low);
      return recentLows.length > 0 ? Math.min(...recentLows) : undefined;
    }

    // Find the most recent and significant support level
    const currentPrice = priceData[priceData.length - 1]?.close;
    if (!currentPrice) return undefined;

    const lastSignificantSupport = this.findLastSignificantSupport(
      supportLevels,
      currentPrice,
      priceData
    );

    return lastSignificantSupport;
  }

  public findLocalMinima(
    priceData: any[]
  ): Array<{ price: number; index: number; strength: number }> {
    const supportLevels: Array<{
      price: number;
      index: number;
      strength: number;
    }> = [];

    // Look for local minima with different window sizes for better detection
    const windowSizes = [3, 5, 7]; // Different window sizes for robustness

    for (const windowSize of windowSizes) {
      for (let i = windowSize; i < priceData.length - windowSize; i++) {
        const current = priceData[i];
        const window = priceData.slice(i - windowSize, i + windowSize + 1);

        // Check if current low is the minimum in the window
        const isLocalMin = window.every((candle) => current.low <= candle.low);

        if (isLocalMin) {
          // Calculate strength based on volume and price action
          const strength = this.calculateSupportStrength(current, window);

          // Avoid duplicate support levels
          const existingSupport = supportLevels.find(
            (s) => Math.abs(s.price - current.low) < current.low * 0.001 // Within 0.1%
          );

          if (!existingSupport || strength > existingSupport.strength) {
            if (existingSupport) {
              // Replace with stronger support
              const index = supportLevels.indexOf(existingSupport);
              supportLevels[index] = {
                price: current.low,
                index: i,
                strength: strength,
              };
            } else {
              supportLevels.push({
                price: current.low,
                index: i,
                strength: strength,
              });
            }
          }
        }
      }
    }

    // Sort by index (most recent first)
    return supportLevels.sort((a, b) => b.index - a.index);
  }

  public calculateSupportStrength(candle: any, window: any[]): number {
    // Calculate strength based on:
    // 1. Volume at the support level
    // 2. How much the price bounced from the support
    // 3. Number of times the level was tested

    const volumeStrength = Math.min(
      (candle.volume / window.reduce((sum, c) => sum + c.volume, 0)) *
        window.length,
      2
    );

    // Calculate bounce strength (how much price moved up after hitting support)
    const bounceStrength = this.calculateBounceStrength(candle, window);

    // Calculate test frequency (how many times this level was approached)
    const testFrequency = this.calculateTestFrequency(candle.low, window);

    return volumeStrength + bounceStrength + testFrequency;
  }

  public calculateBounceStrength(candle: any, window: any[]): number {
    // Look at subsequent candles to see how much price bounced
    const subsequentCandles = window.slice(window.indexOf(candle) + 1);
    if (subsequentCandles.length === 0) return 0;

    const maxBounce =
      Math.max(...subsequentCandles.map((c) => c.high)) - candle.low;
    const bouncePercentage = maxBounce / candle.low;

    return Math.min(bouncePercentage * 10, 2); // Cap at 2
  }

  public calculateTestFrequency(supportPrice: number, window: any[]): number {
    // Count how many times the support level was approached
    const tolerance = supportPrice * 0.002; // 0.2% tolerance
    const tests = window.filter(
      (candle) => Math.abs(candle.low - supportPrice) <= tolerance
    ).length;

    return Math.min(tests / 5, 1); // Cap at 1
  }

  public findLastSignificantSupport(
    supportLevels: Array<{ price: number; index: number; strength: number }>,
    currentPrice: number,
    priceData: any[]
  ): number {
    // Filter out supports that are too close to current price (less than 2% away)
    const significantSupports = supportLevels.filter(
      (support) => support.price < currentPrice * 0.98
    );

    if (significantSupports.length === 0) {
      // If no significant support found, return the strongest support
      const strongestSupport = supportLevels.reduce((prev, current) =>
        current.strength > prev.strength ? current : prev
      );
      return strongestSupport.price;
    }

    // Among significant supports, prefer:
    // 1. More recent supports (higher index)
    // 2. Stronger supports (higher strength)
    // 3. Supports closer to current price (but not too close)

    const recentSupports = significantSupports.slice(0, 5); // Last 5 significant supports
    const bestSupport = recentSupports.reduce((prev, current) => {
      const prevScore = prev.strength + (prev.index / priceData.length) * 0.5;
      const currentScore =
        current.strength + (current.index / priceData.length) * 0.5;
      return currentScore > prevScore ? current : prev;
    });

    return bestSupport.price;
  }

  public calculateMovingAverageSupport(candles: any[]): number | undefined {
    if (candles.length < 20) return undefined;

    const closes = candles.map((c) => parseFloat(c.close));

    // Calculate different moving averages
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, Math.min(50, closes.length));

    // Use the lower of the two moving averages as support
    return Math.min(sma20, sma50);
  }

  public calculateSMA(prices: number[], period: number): number {
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  public calculateFibonacciSupport(candles: any[]): number | undefined {
    if (candles.length < 20) return undefined;

    const recentCandles = candles.slice(-20);
    const highs = recentCandles.map((c) => parseFloat(c.high));
    const lows = recentCandles.map((c) => parseFloat(c.low));

    const highestHigh = Math.max(...highs);
    const lowestLow = Math.min(...lows);

    // Calculate Fibonacci retracement levels
    const range = highestHigh - lowestLow;
    const fib236 = highestHigh - range * 0.236; // 23.6% retracement
    const fib382 = highestHigh - range * 0.382; // 38.2% retracement
    const fib500 = highestHigh - range * 0.5; // 50% retracement

    // Return the most recent significant Fibonacci level
    const currentPrice = parseFloat(candles[candles.length - 1].close);

    if (fib382 < currentPrice) return fib382;
    if (fib500 < currentPrice) return fib500;
    return fib236;
  }

  public calculatePivotPointSupport(candles: any[]): number | undefined {
    if (candles.length < 1) return undefined;

    const lastCandle = candles[candles.length - 1];
    const high = parseFloat(lastCandle.high);
    const low = parseFloat(lastCandle.low);
    const close = parseFloat(lastCandle.close);

    // Calculate pivot point
    const pivotPoint = (high + low + close) / 3;

    // Calculate support levels
    const s1 = 2 * pivotPoint - high; // First support
    const s2 = pivotPoint - (high - low); // Second support

    // Return the first support level
    return s1;
  }


  async getLastSupportLevels(candles: any[], currentPrice: number, lastN = 10): Promise<number[]> {
    const supports = candles.filter((c) => c.low < currentPrice ).map((c) => c.low);
    supports.sort((a, b) => b - a);
    return supports.slice(0,lastN);
  }

  async getLastResistanceLevels(candles: any[], currentPrice: number, lastN = 10): Promise<number[]> {
    const resistances = candles.filter((c) => c.high > currentPrice ).map((c) => c.high);
    resistances.sort((a, b) => a-b);
    return resistances.slice(0,lastN);
  }

  async getLastSupportResistanceLevels(symbol: string, timeframe = '4h', lastN = 10): Promise<{supports: number[], resistances: number[]}> {
    const candles = this.cache[symbol]?.[timeframe] || [];
    if (candles.length === 0) {
      const candles = await this.priceService.fetchCandles(symbol, timeframe, 1000);
      this.cache[symbol] = {
        [timeframe]: candles,
      };
    }
    // const candles = await this.priceService.fetchCandles(symbol, timeframe, 1000);
    const currentPrice = await this.priceService.getPrice(symbol) || 0;
    const supports = await this.getLastSupportLevels(candles, currentPrice, lastN);
    const resistances = await this.getLastResistanceLevels(candles, currentPrice, lastN);
    return {
      supports,
      resistances,
    };
  }
}
