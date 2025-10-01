import mongoose, { Document, Schema } from "mongoose";

// Trading Order Schema
export interface ITradingOrder extends Document {
  orderId: string;
  symbol: string;
  side: "buy" | "sell";
  type: "limit" | "market";
  quantity: number;
  price?: number;
  status: "pending" | "filled" | "cancelled" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  filledAt?: Date;
  cancelledAt?: Date;
  fillPrice?: number;
  fillQuantity?: number;
  fees?: number;
  metadata?: Record<string, any>;
}

const TradingOrderSchema = new Schema<ITradingOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    symbol: { type: String, required: true, index: true },
    side: { type: String, enum: ["buy", "sell"], required: true },
    type: { type: String, enum: ["limit", "market"], required: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["pending", "filled", "cancelled", "rejected"],
      default: "pending",
      index: true,
    },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    filledAt: { type: Date },
    cancelledAt: { type: Date },
    fillPrice: { type: Number, min: 0 },
    fillQuantity: { type: Number, min: 0 },
    fees: { type: Number, min: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "trading_orders",
  }
);

// Stop Loss Schema
export interface IStopLoss extends Document {
  symbol: string;
  price: number;
  strategy: string;
  timeframe?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  triggeredAt?: Date;
  triggeredPrice?: number;
  metadata?: Record<string, any>;
}

const StopLossSchema = new Schema<IStopLoss>(
  {
    symbol: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    strategy: { type: String, required: true },
    timeframe: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    triggeredAt: { type: Date },
    triggeredPrice: { type: Number, min: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "stop_losses",
  }
);

// Price Data Schema
export interface IPriceData extends Document {
  symbol: string;
  price: number;
  volume?: number;
  change24h?: number;
  high24h?: number;
  low24h?: number;
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
}

const PriceDataSchema = new Schema<IPriceData>(
  {
    symbol: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    volume: { type: Number, min: 0 },
    change24h: { type: Number },
    high24h: { type: Number, min: 0 },
    low24h: { type: Number, min: 0 },
    timestamp: { type: Date, default: Date.now, index: true },
    source: { type: String, default: "binance" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "price_data",
  }
);

// Trading Strategy Schema
export interface ITradingStrategy extends Document {
  symbol: string;
  strategy: string;
  timeframe: string;
  isActive: boolean;
  lastUpdate: Date;
  config: Record<string, any>;
  performance?: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    totalPnl: number;
    winRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

const TradingStrategySchema = new Schema<ITradingStrategy>(
  {
    symbol: { type: String, required: true, index: true },
    strategy: { type: String, required: true, index: true },
    timeframe: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    lastUpdate: { type: Date, default: Date.now, index: true },
    config: { type: Schema.Types.Mixed, default: {} },
    performance: {
      totalTrades: { type: Number, default: 0 },
      winningTrades: { type: Number, default: 0 },
      losingTrades: { type: Number, default: 0 },
      totalPnl: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "trading_strategies",
  }
);

TradingStrategySchema.index({ symbol: 1, strategy: 1 });

// Position Schema
export interface IPosition extends Document {
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  leverage: number;
  margin: number;
  isActive: boolean;
  openedAt: Date;
  closedAt?: Date;
  metadata?: Record<string, any>;
}

const PositionSchema = new Schema<IPosition>(
  {
    symbol: { type: String, required: true, index: true },
    side: { type: String, enum: ["long", "short"], required: true },
    quantity: { type: Number, required: true, min: 0 },
    entryPrice: { type: Number, required: true, min: 0 },
    currentPrice: { type: Number, required: true, min: 0 },
    unrealizedPnl: { type: Number, default: 0 },
    realizedPnl: { type: Number, default: 0 },
    leverage: { type: Number, default: 1, min: 1, max: 125 },
    margin: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    openedAt: { type: Date, default: Date.now, index: true },
    closedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "positions",
  }
);

// Trade Log Schema
export interface ITradeLog extends Document {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  fees: number;
  pnl?: number;
  strategy?: string;
  orderId: string;
  executedAt: Date;
  metadata?: Record<string, any>;
}

const TradeLogSchema = new Schema<ITradeLog>(
  {
    symbol: { type: String, required: true, index: true },
    side: { type: String, enum: ["buy", "sell"], required: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    fees: { type: Number, default: 0, min: 0 },
    pnl: { type: Number },
    strategy: { type: String, index: true },
    orderId: { type: String, required: true, index: true },
    executedAt: { type: Date, default: Date.now, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "trade_logs",
  }
);

// Create and export models
export const TradingOrder = mongoose.model<ITradingOrder>(
  "TradingOrder",
  TradingOrderSchema
);
export const StopLoss = mongoose.model<IStopLoss>("StopLoss", StopLossSchema);
export const PriceData = mongoose.model<IPriceData>(
  "PriceData",
  PriceDataSchema
);
export const TradingStrategy = mongoose.model<ITradingStrategy>(
  "TradingStrategy",
  TradingStrategySchema
);
export const Position = mongoose.model<IPosition>("Position", PositionSchema);
export const TradeLog = mongoose.model<ITradeLog>("TradeLog", TradeLogSchema);
