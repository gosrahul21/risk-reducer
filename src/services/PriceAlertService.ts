import { PriceService } from "./PriceService";
import { WebSocketServer } from "./WebSocketServer";
import { v4 as uuidv4 } from 'uuid';

export enum PriceAlertType {
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
}

export class PriceAlertService {
  private priceAlerts: { id: string; symbol: string; price: number; count: number, type: PriceAlertType } [] = [];
  private webSocketServer: WebSocketServer | null = null;

  setWebSocketServer(webSocketServer: WebSocketServer): void {
    this.webSocketServer = webSocketServer;
  }

  async createPriceAlert(symbol: string, price: number,type: PriceAlertType, count = 1): Promise<void> {
    const id = uuidv4();
    this.priceAlerts.push({id, symbol, price, count, type: type });
  }

  async removePriceAlert(id: string): Promise<void> {
    this.priceAlerts = this.priceAlerts.filter((alert) => alert.id !== id);
  }

  async getPriceAlerts(): Promise<{ id: string; symbol: string; price: number; count: number; type: PriceAlertType }[]> {
    return Object.values(this.priceAlerts); 
  }

  async checkPriceAlerts(symbol: string, price: number): Promise<void> {
    const alerts = this.priceAlerts.filter((alert) => alert.symbol === symbol);
    for (const alert of alerts) {
      if (alert.type === PriceAlertType.GREATER_THAN && price >= alert.price) {
        alert.count--;
        if (alert.count <= 0) {
          this.removePriceAlert(symbol);
          // Send WebSocket notification to frontend
          if (this.webSocketServer) {
            this.webSocketServer.broadcastPriceAlert(symbol, alert.price, alert.type);
          }
        }
      }
    }
  }
}