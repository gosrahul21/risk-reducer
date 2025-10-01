import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  Target,
  Zap,
  BarChart3,
  Wallet,
  CreditCard,
  Shield,
} from "lucide-react";
import { apiService } from "../services/api";
import { Order, Position, Balance, PriceData } from "../types";
import { useWebSocket } from "../hooks/useWebSocket";
import TestStopLoss from "../components/TestStopLoss";

interface DashboardStats {
  totalBalance: number;
  activePositions: number;
  openOrders: number;
  stopLosses: number;
}

const Dashboard: React.FC = () => {
  const { prices: realTimePrices, isConnected } = useWebSocket();
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    activePositions: 0,
    openOrders: 0,
    stopLosses: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update prices from WebSocket
  useEffect(() => {
    if (Object.keys(realTimePrices).length > 0) {
      const newPrices: Record<string, number> = {};
      Object.values(realTimePrices).forEach((priceUpdate) => {
        newPrices[priceUpdate.symbol] = priceUpdate.price;
      });
      setPrices((prev) => ({ ...prev, ...newPrices }));
    }
  }, [realTimePrices]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [balanceRes, ordersRes, positionsRes, pricesRes] =
        await Promise.all([
          apiService.getBalance(),
          apiService.getOrders(),
          apiService.getPositions(),
          apiService.getAllPrices(),
        ]);

      // Calculate total balance
      const totalBalance =
        balanceRes?.reduce(
          (sum: number, balance: Balance) =>
            sum + parseFloat(balance.balance + balance.locked_balance),
          0
        ) || 0;

      // Count active positions
      const activePositions =
        positionsRes?.filter((pos: Position) => pos.active_pos > 0).length || 0;

      // Count open orders
      const openOrders = ordersRes?.length || 0;

      setStats({
        totalBalance,
        activePositions,
        openOrders,
        stopLosses: 0, // Will be updated when stop loss data is available
      });

      setRecentOrders(ordersRes?.slice(0, 5) || []);
      setPositions(positionsRes?.slice(0, 5) || []);
      setPrices((pricesRes.prices as any) || {});
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  console.log({ prices });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to TradeMaster</h1>
            <p className="text-blue-100 text-lg">
              Professional trading dashboard for crypto futures
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
              <Activity
                className={`h-5 w-5 ${
                  isConnected
                    ? "text-green-300 animate-pulse"
                    : "text-yellow-300"
                }`}
              />
              <span className="font-medium">
                {isConnected ? "Live Trading" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Balance
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalBalance)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>+2.5% from last week</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Active Positions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activePositions}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <Activity className="h-4 w-4 mr-1" />
            <span>Live positions</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Open Orders
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.openOrders}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 shadow-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-orange-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>Pending execution</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Stop Losses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.stopLosses}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-pink-600 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <Target className="h-4 w-4 mr-1" />
            <span>Risk management</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No orders
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first order.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            order.side === "buy"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {order.side === "buy" ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <TrendingDown className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.side?.toUpperCase()} {order.pair}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.total_quantity} @ {formatPrice(order.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {order.order_type?.replace("_", " ").toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Market Prices */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900">
                Market Prices
              </h3>
            </div>
            <div className="p-6">
              {Object.keys(prices).length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No prices
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Market data will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(prices)
                    .slice(0, 5)
                    .map(([symbol, price]) => (
                      <div
                        key={symbol}
                        className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold">
                            {symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {symbol}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(price)}
                          </p>
                          <div className="flex items-center text-xs text-green-600">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            <span>+2.1%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Stop Loss Component */}
      <TestStopLoss />

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <CreditCard className="h-5 w-5" />
            <span className="font-medium">New Order</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">View Positions</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Set Stop Loss</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
