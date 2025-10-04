export interface Order {
  id: string;
  client_order_id: string | null;
  pair: string;
  side: "buy" | "sell";
  status: string;
  order_type: "market_order" | "limit_order";
  stop_trigger_instruction?: string;
  notification?: string;
  leverage: number;
  maker_fee: number;
  taker_fee: number;
  fee_amount: number;
  price: number;
  stop_price: number;
  avg_price: number;
  total_quantity: number;
  remaining_quantity: number;
  cancelled_quantity: number;
  ideal_margin: number;
  order_category?: string | null;
  stage?: string;
  group_id?: string | null;
  liquidation_fee?: number | null;
  position_margin_type?: string;
  settlement_currency_conversion_price?: number;
  take_profit_price?: number | null;
  stop_loss_price?: number | null;
  margin_currency_short_name: "USDT" | "INR";
  display_message?: string;
  group_status?: string | null;
  created_at: number;
  updated_at: number;
  // Legacy fields for backward compatibility
  market?: string;
  quantity?: number;
  wallet_percentage?: number;
}

export interface Position {
  id: string;
  pair: string;
  active_pos: number;
  inactive_pos_buy: number;
  inactive_pos_sell: number;
  avg_price: number;
  liquidation_price: number;
  locked_margin: number;
  locked_user_margin: number;
  locked_order_margin: number;
  take_profit_trigger: number;
  stop_loss_trigger: number;
  leverage: number | null;
  maintenance_margin: number | null;
  mark_price: number | null;
  margin_type: string;
  settlement_currency_avg_price: number;
  margin_currency_short_name: string;
  updated_at: number;
}

export interface Balance {
  currency: string;
  currency_short_name: string;
  balance: string;
  locked_balance: string;
  total_balance: string;
  available_balance?: string;
}

export interface PriceData {
  symbol: string;
  price: number;
  change_24h?: number;
  volume?: number;
  timestamp?: number;
}

export interface StopLoss {
  id?: string;
  symbol: string;
  price: number;
  quantity?: number;
  side?: "buy" | "sell";
  status?: string;
  created_at?: string;
  timestamp: number;
}

export interface Strategy {
  symbol: string;
  strategy: string;
  timeframe: string;
  stopLossPrice: number;
  created_at: string;
  status?: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CalculatedValues {
  wallet_percentage: number;
  investment_amount: string;
  current_price: number;
  calculated_quantity: number;
}

export enum PriceAlertType {
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
}

export interface PriceAlert {
  id: string;
  symbol: string;
  price: number;
  count: number;
  type: PriceAlertType;
}

export interface PriceAlertNotification {
  symbol: string;
  price: number;
  type: PriceAlertType;
  message: string;
}
