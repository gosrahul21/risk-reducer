// Global type definitions for the Futures Trading Bot

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Futures Trading Types
export interface FuturesOrder {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET";
  quantity: number;
  price?: number;
  timeInForce: "GTC" | "IOC" | "FOK";
  reduceOnly: boolean;
  closePosition: boolean;
  positionSide: "LONG" | "SHORT" | "BOTH";
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FuturesPosition {
  symbol: string;
  positionSide: "LONG" | "SHORT";
  positionAmount: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  percentage: number;
  leverage: number;
  notional: number;
  isolated: boolean;
  updateTime: Date;
}

export interface FuturesBalance {
  asset: string;
  walletBalance: number;
  unrealizedPnl: number;
  marginBalance: number;
  maintMargin: number;
  initialMargin: number;
  positionInitialMargin: number;
  openOrderInitialMargin: number;
  crossWalletBalance: number;
  crossUnPnl: number;
  availableBalance: number;
  maxWithdrawAmount: number;
  marginAvailable: boolean;
  updateTime: Date;
}

export interface FuturesAccount {
  totalWalletBalance: number;
  totalUnrealizedPnl: number;
  totalMarginBalance: number;
  totalInitialMargin: number;
  totalMaintMargin: number;
  totalPositionInitialMargin: number;
  totalOpenOrderInitialMargin: number;
  totalCrossWalletBalance: number;
  totalCrossUnPnl: number;
  availableBalance: number;
  maxWithdrawAmount: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: Date;
}

export type OrderStatus =
  | "NEW"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELED"
  | "PENDING_CANCEL"
  | "REJECTED"
  | "EXPIRED";

export interface StopLossLevel {
  symbol: string;
  price: number;
  createdAt: Date;
  triggered: boolean;
}

export interface StrategyConfig {
  symbol: string;
  strategy:
    | "last_support"
    | "last_close"
    | "moving_average"
    | "fibonacci"
    | "pivot_point";
  timeframe: "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
  interval: number;
  lastUpdate: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: Date;
  volume?: number;
  change24h?: number;
}

export interface FundingRate {
  symbol: string;
  fundingRate: number;
  fundingTime: Date;
  markPrice: number;
}

// WebSocket Data Types
export interface TickerData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  weightedAvgPrice: number;
  prevClosePrice: number;
  lastPrice: number;
  lastQty: number;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  openTime: Date;
  closeTime: Date;
  firstId: number;
  lastId: number;
  count: number;
}

// Express Request extensions
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}
