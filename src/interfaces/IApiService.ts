// Interface for API service (Dependency Inversion Principle)
export interface IApiService {
  createOrder(orderData: any): Promise<any>;
  getOrders(symbol?: string): Promise<any>;
  getPositions(symbol?: string): Promise<any>;
  getBalance(): Promise<any>;
  getAccount(): Promise<any>;
  cancelOrder(orderId: string, symbol?: string): Promise<any>;
  setLeverage(symbol: string, leverage: number): Promise<any>;
}

export interface IWebSocketService {
  connect(symbols: string[]): void;
  disconnect(): void;
  onPriceUpdate(callback: (symbol: string, price: number) => void): void;
  onError(callback: (error: Error) => void): void;
}

export interface IStrategyService {
  addStrategyStopLoss(
    symbol: string,
    strategy: string,
    timeframe: string
  ): void;
  removeStrategyStopLoss(symbol: string): void;
  updateStopLoss(symbol: string): Promise<void>;
  getAllStrategies(): any;
}

export interface IStopLossService {
  setStopLoss(symbol: string, price: number): void;
  getStopLoss(symbol: string): number | undefined;
  removeStopLoss(symbol: string): void;
  getAllStopLosses(): { [key: string]: number };
  checkStopLoss(symbol: string, currentPrice: number): boolean;
}
