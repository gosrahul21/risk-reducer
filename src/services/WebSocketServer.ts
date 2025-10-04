import WebSocket from "ws";
import { Server as HttpServer } from "http";
import { IWebSocketService } from "../interfaces/IApiService";
import { PriceAlertType } from "./PriceAlertService";

export interface Notification {
  id: string;
  type:
    | "price_update"
    | "price_alert"
    | "order_update"
    | "stop_loss_triggered"
    | "strategy_alert"
    | "system";
  title: string;
  message: string;
  timestamp: number;
  data?: any;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h?: number;
  volume24h?: number;
  timestamp: number;
}

export class WebSocketServer {
  private wss: WebSocket.Server;
  private clients: Set<WebSocket> = new Set();
  private priceCallbacks: ((symbol: string, price: number) => void)[] = [];
  private errorCallbacks: ((error: Error) => void)[] = [];

  constructor(server: HttpServer) {
    this.wss = new WebSocket.Server({
      server,
      path: "/ws",
    });

    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("🔌 New WebSocket client connected");
      this.clients.add(ws);

      // Send welcome message
      this.sendToClient(ws, {
        type: "system",
        data: { message: "Connected to trading server" },
      });

      ws.on("message", (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error("Invalid WebSocket message:", error);
        }
      });

      ws.on("close", () => {
        console.log("🔌 WebSocket client disconnected");
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("WebSocket client error:", error);
        this.clients.delete(ws);
      });
    });

    this.wss.on("error", (error) => {
      console.error("WebSocket server error:", error);
    });
  }

  private handleClientMessage(ws: WebSocket, data: any): void {
    switch (data.type) {
      case "subscribe_prices":
        // Client wants to subscribe to price updates
        this.sendToClient(ws, {
          type: "subscription_confirmed",
          data: { message: "Subscribed to price updates" },
        });
        break;
      case "subscribe_notifications":
        // Client wants to subscribe to notifications
        this.sendToClient(ws, {
          type: "subscription_confirmed",
          data: { message: "Subscribed to notifications" },
        });
        break;
      case "ping":
        // Heartbeat
        this.sendToClient(ws, { type: "pong" });
        break;
      default:
        console.log("Unknown message type:", data.type);
    }
  }

  // Broadcast price update to all connected clients
  public broadcastPriceUpdate(
    symbol: string,
    price: number,
    change24h?: number,
    volume24h?: number
  ): void {
    const priceUpdate: PriceUpdate = {
      symbol,
      price,
      change24h: change24h!,
      volume24h: volume24h!,
      timestamp: Date.now(),
    };

    this.broadcast({
      type: "price_update",
      data: priceUpdate,
    });

    // Notify internal callbacks
    this.priceCallbacks.forEach((callback) => callback(symbol, price));
  }

    // Broadcast price update to all connected clients
    public broadcastPriceAlert(
      symbol: string,
      price: number,
      type: PriceAlertType
    ): void {
      const message = `Price Alert: ${symbol} has reached ${price}`;
      const priceUpdate = {
        symbol,
        price,
        type,
        message,
      };
      
      this.broadcast({
        type: "price_alert",
        data: priceUpdate,
      });
  
      // Notify internal callbacks
      this.priceCallbacks.forEach((callback) => callback(symbol, price));
    }

  // Broadcast notification to all connected clients
  public broadcastNotification(
    notification: Omit<Notification, "id" | "timestamp">
  ): void {
    const fullNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    this.broadcast({
      type: "notification",
      data: fullNotification,
    });
  }

  // Send order update notification
  public sendOrderUpdate(
    orderId: string,
    status: string,
    message: string
  ): void {
    this.broadcastNotification({
      type: "order_update",
      title: "Order Update",
      message: `Order ${orderId} status: ${status}`,
      data: { orderId, status },
    });
  }

  // Send stop loss triggered notification
  public sendStopLossTriggered(
    symbol: string,
    price: number,
    stopLossPrice: number
  ): void {
    this.broadcastNotification({
      type: "stop_loss_triggered",
      title: "Stop Loss Triggered",
      message: `${symbol} stop loss triggered at ${price} (stop: ${stopLossPrice})`,
      data: { symbol, price, stopLossPrice },
    });
  }

  // Send strategy alert
  public sendStrategyAlert(
    message: string,
    data?: any
  ): void {
    this.broadcastNotification({
      type: "strategy_alert",
      title: "Strategy Alert",
      message: `${data.strategy} on ${data.symbol}: ${message}`,
      data: { ...data },
    });
  }

  // Send system notification
  public sendSystemNotification(
    title: string,
    message: string,
    data?: any
  ): void {
    this.broadcastNotification({
      type: "system",
      title,
      message,
      data,
    });
  }

  // Public broadcast method for custom messages
  public broadcast(message: any): void {
    const messageStr = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  private sendToClient(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Subscribe to price updates from external WebSocket service
  public onPriceUpdate(
    callback: (symbol: string, price: number) => void
  ): void {
    this.priceCallbacks.push(callback);
  }

  public onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public close(): void {
    this.wss.close();
  }
}
