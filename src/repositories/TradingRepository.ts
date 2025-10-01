import {
  ITradingOrder,
  IStopLoss,
  IPriceData,
  ITradingStrategy,
  IPosition,
  ITradeLog,
  TradingOrder,
  StopLoss,
  PriceData,
  TradingStrategy,
  Position,
  TradeLog,
} from "../models/TradingData";

// Trading Order Repository
export class TradingOrderRepository {
  async create(orderData: Partial<ITradingOrder>): Promise<ITradingOrder> {
    const order = new TradingOrder(orderData);
    return await order.save();
  }

  async findById(orderId: string): Promise<ITradingOrder | null> {
    return await TradingOrder.findOne({ orderId });
  }

  async findBySymbol(symbol: string): Promise<ITradingOrder[]> {
    return await TradingOrder.find({ symbol }).sort({ createdAt: -1 });
  }

  async findByStatus(status: string): Promise<ITradingOrder[]> {
    return await TradingOrder.find({ status }).sort({ createdAt: -1 });
  }

  async updateStatus(
    orderId: string,
    status: string,
    additionalData?: Partial<ITradingOrder>
  ): Promise<ITradingOrder | null> {
    const updateData = { status, updatedAt: new Date(), ...additionalData };
    return await TradingOrder.findOneAndUpdate({ orderId }, updateData, {
      new: true,
    });
  }

  async delete(orderId: string): Promise<boolean> {
    const result = await TradingOrder.deleteOne({ orderId });
    return result.deletedCount > 0;
  }

  async getRecentOrders(limit: number = 100): Promise<ITradingOrder[]> {
    return await TradingOrder.find().sort({ createdAt: -1 }).limit(limit);
  }
}

// Stop Loss Repository
export class StopLossRepository {
  async create(stopLossData: Partial<IStopLoss>): Promise<IStopLoss> {
    const stopLoss = new StopLoss(stopLossData);
    return await stopLoss.save();
  }

  async findBySymbol(symbol: string): Promise<IStopLoss | null> {
    return await StopLoss.findOne({ symbol, isActive: true });
  }

  async findAllActive(): Promise<IStopLoss[]> {
    return await StopLoss.find({ isActive: true }).sort({ createdAt: -1 });
  }

  async update(
    symbol: string,
    updateData: Partial<IStopLoss>
  ): Promise<IStopLoss | null> {
    return await StopLoss.findOneAndUpdate(
      { symbol, isActive: true },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
  }

  async deactivate(symbol: string): Promise<IStopLoss | null> {
    return await StopLoss.findOneAndUpdate(
      { symbol, isActive: true },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
  }

  async trigger(
    symbol: string,
    triggeredPrice: number
  ): Promise<IStopLoss | null> {
    return await StopLoss.findOneAndUpdate(
      { symbol, isActive: true },
      {
        isActive: false,
        triggeredAt: new Date(),
        triggeredPrice,
        updatedAt: new Date(),
      },
      { new: true }
    );
  }

  async getHistory(symbol?: string, limit: number = 100): Promise<IStopLoss[]> {
    const filter = symbol ? { symbol } : {};
    return await StopLoss.find(filter).sort({ createdAt: -1 }).limit(limit);
  }
}

// Trading Strategy Repository
export class TradingStrategyRepository {
  async create(
    strategyData: Partial<ITradingStrategy>
  ): Promise<ITradingStrategy> {
    const strategy = new TradingStrategy(strategyData);
    return await strategy.save();
  }

  async addStrategy(
    strategyData: Partial<ITradingStrategy>
  ): Promise<ITradingStrategy> {
    const strategy = new TradingStrategy(strategyData);
    return await strategy.save();
  }

  async findBySymbol(symbol: string): Promise<ITradingStrategy | null> {
    return await TradingStrategy.findOne({ symbol, isActive: true });
  }

  async findAllActive(): Promise<ITradingStrategy[]> {
    return await TradingStrategy.find({ isActive: true }).sort({
      createdAt: -1,
    });
  }

  async update(
    symbol: string,
    updateData: Partial<ITradingStrategy>
  ): Promise<ITradingStrategy | null> {
    return await TradingStrategy.findOneAndUpdate(
      { symbol, isActive: true },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
  }

  async updateLastUpdate(symbol: string): Promise<ITradingStrategy | null> {
    return await TradingStrategy.findOneAndUpdate(
      { symbol, isActive: true },
      { lastUpdate: new Date(), updatedAt: new Date() },
      { new: true }
    );
  }

  async deactivate(symbol: string): Promise<ITradingStrategy | null> {
    return await TradingStrategy.findOneAndUpdate(
      { symbol, isActive: true },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
  }

  async removeStrategy(symbol: string): Promise<ITradingStrategy | null> {
    return await TradingStrategy.findOneAndDelete({ symbol, isActive: true });
  }

  async updatePerformance(
    symbol: string,
    performance: Partial<ITradingStrategy["performance"]>
  ): Promise<ITradingStrategy | null> {
    return await TradingStrategy.findOneAndUpdate(
      { symbol, isActive: true },
      {
        performance: { ...performance, updatedAt: new Date() },
        updatedAt: new Date(),
      },
      { new: true }
    );
  }
}

// Position Repository
export class PositionRepository {
  async create(positionData: Partial<IPosition>): Promise<IPosition> {
    const position = new Position(positionData);
    return await position.save();
  }

  async findBySymbol(symbol: string): Promise<IPosition | null> {
    return await Position.findOne({ symbol, isActive: true });
  }

  async findAllActive(): Promise<IPosition[]> {
    return await Position.find({ isActive: true }).sort({ openedAt: -1 });
  }

  async update(
    symbol: string,
    updateData: Partial<IPosition>
  ): Promise<IPosition | null> {
    return await Position.findOneAndUpdate(
      { symbol, isActive: true },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
  }

  async close(
    symbol: string,
    closePrice: number,
    realizedPnl: number
  ): Promise<IPosition | null> {
    return await Position.findOneAndUpdate(
      { symbol, isActive: true },
      {
        isActive: false,
        closedAt: new Date(),
        currentPrice: closePrice,
        realizedPnl,
        updatedAt: new Date(),
      },
      { new: true }
    );
  }

  async updateCurrentPrice(
    symbol: string,
    currentPrice: number
  ): Promise<IPosition | null> {
    return await Position.findOneAndUpdate(
      { symbol, isActive: true },
      {
        currentPrice,
        unrealizedPnl: this.calculateUnrealizedPnl(symbol, currentPrice),
        updatedAt: new Date(),
      },
      { new: true }
    );
  }

  private calculateUnrealizedPnl(symbol: string, currentPrice: number): number {
    // This would need to be implemented based on position data
    // For now, returning 0 as placeholder
    return 0;
  }
}

// Trade Log Repository
export class TradeLogRepository {
  async create(tradeData: Partial<ITradeLog>): Promise<ITradeLog> {
    const trade = new TradeLog(tradeData);
    return await trade.save();
  }

  async findBySymbol(
    symbol: string,
    limit: number = 100
  ): Promise<ITradeLog[]> {
    return await TradeLog.find({ symbol })
      .sort({ executedAt: -1 })
      .limit(limit);
  }

  async findByStrategy(
    strategy: string,
    limit: number = 100
  ): Promise<ITradeLog[]> {
    return await TradeLog.find({ strategy })
      .sort({ executedAt: -1 })
      .limit(limit);
  }

  async getRecentTrades(limit: number = 100): Promise<ITradeLog[]> {
    return await TradeLog.find().sort({ executedAt: -1 }).limit(limit);
  }

  async getTradingStats(symbol?: string, strategy?: string): Promise<any> {
    const filter: any = {};
    if (symbol) filter.symbol = symbol;
    if (strategy) filter.strategy = strategy;

    return await TradeLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          totalVolume: { $sum: { $multiply: ["$quantity", "$price"] } },
          totalFees: { $sum: "$fees" },
          totalPnl: { $sum: { $ifNull: ["$pnl", 0] } },
          avgPrice: { $avg: "$price" },
          avgQuantity: { $avg: "$quantity" },
        },
      },
    ]);
  }
}
