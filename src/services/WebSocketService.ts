import WebSocket from "ws";
import { IWebSocketService } from "../interfaces/IApiService";

// WebSocket Service - Single Responsibility: Handle WebSocket connections
export class WebSocketService implements IWebSocketService {
  private connections: Map<string, WebSocket> = new Map();
  private priceCallbacks: ((symbol: string, price: number) => void)[] = [];
  private errorCallbacks: ((error: Error) => void)[] = [];

  connect(symbols: string[]): void {
    symbols.forEach((symbol) => {
      this.connectSymbol(symbol);
    });
  }

  private connectSymbol(symbol: string): void {
    const streamName = symbol.toLowerCase() + "@ticker";
    const ws = new WebSocket(`wss://fstream.binance.com/ws/${streamName}`);

    ws.on("open", () => {
      console.log(`✅ Binance WS connected: ${symbol}`);
      this.connections.set(symbol, ws);
    });

    ws.on("message", (msg) => {
      const data = JSON.parse(msg.toString());
      const symbolUpper = symbol.toUpperCase();

      if (data.c) {
        const price = parseFloat(data.c);
        this.notifyPriceUpdate(symbolUpper, price);
      }
    });

    ws.on("close", () => {
      console.log(`❌ Binance WS closed: ${symbol}`);
      this.connections.delete(symbol);
      // Reconnect after 5 seconds
      setTimeout(() => {
        console.log(`🔄 Reconnecting ${symbol}...`);
        this.connectSymbol(symbol);
      }, 5000);
    });

    ws.on("error", (err) => {
      console.error(`⚠️ Binance WS Error (${symbol}):`, err.message);
      this.notifyError(err);
    });
  }

  disconnect(): void {
    this.connections.forEach((ws) => {
      ws.close();
    });
    this.connections.clear();
  }

  onPriceUpdate(callback: (symbol: string, price: number) => void): void {
    this.priceCallbacks.push(callback);
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  private notifyPriceUpdate(symbol: string, price: number): void {
    this.priceCallbacks.forEach((callback) => callback(symbol, price));
  }

  private notifyError(error: Error): void {
    this.errorCallbacks.forEach((callback) => callback(error));
  }
}
