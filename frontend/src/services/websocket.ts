export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h?: number;
  volume24h?: number;
  timestamp: number;
}

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

export interface WebSocketMessage {
  type: string;
  data?: any;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private priceCallbacks: ((price: PriceUpdate) => void)[] = [];
  private notificationCallbacks: ((notification: Notification) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (
        this.isConnecting ||
        (this.ws && this.ws.readyState === WebSocket.OPEN)
      ) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("🔌 WebSocket connected to trading server");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.notifyConnectionStatus(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onclose = (event) => {
          console.log("🔌 WebSocket disconnected:", event.code, event.reason);
          this.isConnecting = false;
          this.notifyConnectionStatus(false);
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
          this.notifyConnectionStatus(false);
          reject(error);
        };

        // Send subscription messages
        setTimeout(() => {
          this.subscribeToPrices();
          this.subscribeToNotifications();
        }, 1000);
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(
        `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect().catch(() => {
          // Reconnection failed, will try again
        });
      }, delay);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case "price_update":
        if (message.data) {
          this.notifyPriceUpdate(message.data as PriceUpdate);
        }
        break;
      case "price_alert":
        if (message.data) {
          // Convert price alert to notification format
          const alertData = message.data;
          const notification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type: "price_alert",
            title: "Price Alert",
            message: alertData.message || `Price Alert: ${alertData.symbol} has reached ${alertData.price}`,
            timestamp: Date.now(),
            data: alertData,
          };
          this.notifyNotification(notification);
        }
        break;
      case "notification":
        if (message.data) {
          this.notifyNotification(message.data as Notification);
        }
        break;
      case "subscription_confirmed":
        console.log("✅ Subscription confirmed:", message.data?.message);
        break;
      case "pong":
        // Heartbeat response
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  }

  private subscribeToPrices(): void {
    this.send({
      type: "subscribe_prices",
    });
  }

  private subscribeToNotifications(): void {
    this.send({
      type: "subscribe_notifications",
    });
  }

  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Public methods for subscribing to events
  onPriceUpdate(callback: (price: PriceUpdate) => void): void {
    this.priceCallbacks.push(callback);
  }

  onNotification(callback: (notification: Notification) => void): void {
    this.notificationCallbacks.push(callback);
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.push(callback);
  }

  // Private notification methods
  private notifyPriceUpdate(price: PriceUpdate): void {
    this.priceCallbacks.forEach((callback) => callback(price));
  }

  private notifyNotification(notification: Notification): void {
    this.notificationCallbacks.forEach((callback) => callback(notification));
  }

  private notifyConnectionStatus(connected: boolean): void {
    this.connectionCallbacks.forEach((callback) => callback(connected));
  }

  // Heartbeat to keep connection alive
  startHeartbeat(): void {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" });
      }
    }, 30000); // Ping every 30 seconds
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
export const websocketService = new WebSocketService(
  process.env.REACT_APP_WS_URL || "ws://localhost:3000/ws"
);
