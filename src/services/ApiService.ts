import axios from "axios";
import crypto from "crypto";
import { IApiService } from "../interfaces/IApiService";

// API Service - Futures only
export class ApiService implements IApiService {
  private baseUrl: string;
  private futuresBaseUrl: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.baseUrl = process.env.COINDCX_BASE_URL || "https://api.coindcx.com";
    this.futuresBaseUrl =
      process.env.COINDCX_FUTURES_URL || "https://api.coindcx.com/futures";
    this.apiKey = process.env.COINDCX_API_KEY || "";
    this.apiSecret = process.env.COINDCX_API_SECRET || "";
  }

  private generateSignature(payload: any): string {
    return crypto
      .createHmac("sha256", this.apiSecret)
      .update(payload)
      .digest("hex");
  }

  private getHeaders(signature: string) {
    return {
      "Content-Type": "application/json",
      "X-AUTH-APIKEY": this.apiKey,
      "X-AUTH-SIGNATURE": signature,
    };
  }

  // ----------------------
  // CREATE FUTURES ORDER
  // ----------------------
  async createOrder(orderData: any): Promise<any> {
    const timeStamp = Math.floor(Date.now());

    const body = {
      timestamp: timeStamp,
      order: {
        side: orderData.side, // "buy" or "sell"
        pair: orderData.pair, // trading pair
        order_type: orderData.order_type, // "market_order" or "limit_order"
        price: orderData.price,
        stop_price: orderData.stop_price,
        total_quantity: orderData.total_quantity,
        leverage: orderData.leverage || 1,
        notification: orderData.notification || "email_notification",
        time_in_force: orderData.time_in_force || "good_till_cancel",
        hidden: orderData.hidden || false,
        post_only: orderData.post_only || false,
        margin_currency_short_name:
          orderData.margin_currency_short_name || "INR",
        take_profit_price: orderData.take_profit_price,
        stop_loss_price: orderData.stop_loss_price,
      },
    };

    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = this.generateSignature(payload);

    const response = await axios.post(
      `${this.baseUrl}/exchange/v1/derivatives/futures/orders/create`,
      body,
      {
        headers: this.getHeaders(signature),
      }
    );

    return response.data;
  }

  // ----------------------
  // GET ACTIVE FUTURES ORDERS
  // ----------------------
  async getOrders(status = "open"): Promise<any> {
    const timeStamp = Math.floor(Date.now());
    const body = {
      timestamp: timeStamp,
      page: 1,
      size: 100,
      status: status,
      side: "buy",
      margin_currency_short_name: ["INR", "USDT"],
    };

    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = this.generateSignature(payload);

    const response = await axios.post(
      `${this.baseUrl}/exchange/v1/derivatives/futures/orders`,
      body,
      {
        headers: this.getHeaders(signature),
      }
    );

    return response.data;
  }

  // ----------------------
  // GET OPEN FUTURES POSITIONS
  // ----------------------
  async getPositions(symbol?: string): Promise<any> {
    const timeStamp = Math.floor(Date.now());
    const body = {
      timestamp: timeStamp,
      pair: symbol || undefined,
      page: 1,
      size: 5,
      margin_currency_short_name: ["USDT", "INR"],
    };

    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = this.generateSignature(payload);

    const response = await axios.post(
      `${this.baseUrl}/exchange/v1/derivatives/futures/positions`,
      body,
      {
        headers: this.getHeaders(signature),
      }
    );

    return response.data;
  }

  // ----------------------
  // GET FUTURES BALANCE
  // ----------------------
  async getBalance(): Promise<any> {
    const timeStamp = Math.floor(Date.now());
    const body = { timestamp: timeStamp };

    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = this.generateSignature(payload);

    const response = await axios.request({
      url: `${this.baseUrl}/exchange/v1/derivatives/futures/wallets`,
      method: "GET",
      headers: this.getHeaders(signature),
      data: body,
    });

    return response.data;
  }

  // ----------------------
  // GET FUTURES ACCOUNT INFO
  // ----------------------
  async getAccount(): Promise<any> {
    const timeStamp = Math.floor(Date.now());
    const body = { timestamp: timeStamp };

    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto
      .createHmac("sha256", this.apiSecret)
      .update(payload)
      .digest("hex");

    const response = await axios.post(
      `${this.baseUrl}/exchange/v1/derivatives/futures/account`,
      body,
      {
        headers: this.getHeaders(signature),
      }
    );

    return response.data;
  }

  // ----------------------
  // CANCEL FUTURES ORDER
  // ----------------------
  async cancelOrder(orderId: string): Promise<any> {
    const timeStamp = Math.floor(Date.now());
    const body = {
      timestamp: timeStamp,
      id: orderId,
    };

    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = this.generateSignature(payload);

    const response = await axios.post(
      `${this.baseUrl}/exchange/v1/derivatives/futures/orders/cancel`,
      body,
      {
        headers: this.getHeaders(signature),
      }
    );

    return response.data;
  }

  // ----------------------
  // SET FUTURES LEVERAGE
  // ----------------------
  async setLeverage(symbol: string, leverage: number): Promise<any> {
    const timeStamp = Math.floor(Date.now());
    const body = {
      timestamp: timeStamp,
      pair: symbol,
      leverage: parseInt(leverage.toString()),
    };

    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = this.generateSignature(payload);

    const response = await axios.post(
      `${this.baseUrl}/exchange/v1/derivatives/futures/leverage`,
      body,
      {
        headers: this.getHeaders(signature),
      }
    );

    return response.data;
  }
}
      
      