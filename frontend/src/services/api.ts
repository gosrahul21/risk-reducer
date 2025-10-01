import axios from "axios";
import {
  Order,
  Position,
  Balance,
  PriceData,
  StopLoss,
  Strategy,
  ApiResponse,
} from "../types";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging and cache busting
api.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      "❌ API Response Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  async getHealth(): Promise<ApiResponse> {
    const response = await api.get("/");
    return response.data;
  },

  // Orders
  async createOrder(orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    const response = await api.post("/order", orderData);
    return response.data;
  },

  async getOrders(symbol?: string): Promise<Order[]> {
    const params = symbol ? { symbol } : {};
    const response = await api.get("/orders", { params });
    return response.data.data || response.data; // Handle both wrapped and direct responses
  },

  async cancelOrder(orderId: string): Promise<ApiResponse> {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

  // Positions
  async getPositions(symbol?: string): Promise<Position[]> {
    const params = symbol ? { symbol } : {};
    const response = await api.get("/positions", { params });
    return response.data.data || response.data;
  },

  async getBalance(): Promise<Balance[]> {
    const response = await api.get("/balance");
    return response.data.data || response.data;
  },

  async getAccount(): Promise<ApiResponse> {
    const response = await api.get("/account");
    return response.data;
  },

  async setLeverage(symbol: string, leverage: number): Promise<ApiResponse> {
    const response = await api.post("/leverage", { symbol, leverage });
    return response.data;
  },

  // Stop Loss
  async setStopLoss(
    symbol: string,
    price: number
  ): Promise<ApiResponse<StopLoss>> {
    const response = await api.post("/stoploss", { symbol, price });
    return response.data;
  },

  async getStopLoss(symbol: string): Promise<StopLoss> {
    const response = await api.get(`/stoploss/${symbol}`);
    return response.data.data || response.data;
  },

  async removeStopLoss(symbol: string): Promise<ApiResponse> {
    const response = await api.delete(`/stoploss/${symbol}`);
    return response.data;
  },

  async getAllStopLosses(): Promise<{stopLosses: StopLoss[], currentPrices: PriceData[]}> {
    const response = await api.get("/levels");
    return response.data.data || response.data;
  },

  async getStopLossHistory(): Promise<StopLoss[]> {
    const response = await api.get("/stoploss/history");
    return response.data.data || response.data;
  },

  // Strategies
  async addStrategyStopLoss(
    symbol: string,
    strategy: string,
    timeframe: string
  ): Promise<ApiResponse<Strategy>> {
    const response = await api.post("/stoploss/strategy", {
      symbol,
      strategy,
      timeframe,
    });
    return response.data;
  },

  async removeStrategyStopLoss(symbol: string): Promise<ApiResponse> {
    const response = await api.delete(`/stoploss/strategy/${symbol}`);
    return response.data;
  },

  async getAllStrategies(): Promise<any> {
    const response = await api.get("/strategies");
    return response.data.data || response.data;
  },

  // Prices
  async getPrice(symbol: string): Promise<PriceData> {
    const response = await api.get(`/price/${symbol}`);
    return response.data.data || response.data;
  },

  async getAllPrices(): Promise<{ prices: Record<string, number> }> {
    const response = await api.get("/prices");
    return response.data.data || response.data;
  },
};

export default apiService;
