import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Target,
  Zap,
  Wallet,
  BarChart3,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { apiService } from "../services/api";
import { Position, Balance } from "../types";

const Positions: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [balance, setBalance] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [positionsRes, balanceRes] = await Promise.all([
        apiService.getPositions(),
        apiService.getBalance(),
      ]);
      setPositions(positionsRes || []);
      setBalance(balanceRes || []);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
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

  const calculatePnL = (position: Position) => {
    if (!position.avg_price || !position.mark_price) return 0;
    const pnl =
      (position.mark_price - position.avg_price) * position.active_pos;
    return pnl;
  };

  const calculatePnLPercentage = (position: Position) => {
    if (!position.avg_price || !position.mark_price) return 0;
    return (
      ((position.mark_price - position.avg_price) / position.avg_price) * 100
    );
  };

  const totalPnL = positions.reduce((sum, pos) => sum + calculatePnL(pos), 0);
  const activePositions = positions.filter((pos) => pos.active_pos > 0);
  const totalBalance = balance.reduce(
    (sum, bal) => sum + parseFloat(bal.balance + bal.locked_balance),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Positions
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor your active positions and portfolio performance
          </p>
        </div>
        <button
          onClick={loadData}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Balance
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalBalance)}
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

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Active Positions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {activePositions.length}
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

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total P&L
              </p>
              <p
                className={`text-2xl font-bold ${
                  totalPnL >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(totalPnL)}
              </p>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${
                totalPnL >= 0
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-red-500 to-pink-600"
              }`}
            >
              {totalPnL >= 0 ? (
                <ArrowUpRight className="h-6 w-6 text-white" />
              ) : (
                <ArrowDownRight className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
          <div
            className={`mt-4 flex items-center text-sm ${
              totalPnL >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {totalPnL >= 0 ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            <span>Unrealized P&L</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Positions List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Positions
          </h3>
        </div>
        {activePositions.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No active positions
              </h3>
              <p className="text-gray-500">
                Your active positions will appear here when you have open
                trades.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Side
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mark Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leverage
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activePositions.map((position) => {
                  const pnl = calculatePnL(position);
                  const pnlPercentage = calculatePnLPercentage(position);
                  return (
                    <tr
                      key={position.id}
                      className="hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold">
                            {position.pair.slice(0, 2)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {position.pair}
                            </div>
                            <div className="text-sm text-gray-500">
                              {position.margin_currency_short_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`flex items-center ${
                            position.active_pos > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {position.active_pos > 0 ? (
                            <TrendingUp className="h-4 w-4 mr-2" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-2" />
                          )}
                          <span className="text-sm font-medium">
                            {position.active_pos > 0 ? "LONG" : "SHORT"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Math.abs(position.active_pos)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPrice(position.avg_price || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPrice(position.mark_price || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${
                            pnl >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(pnl)}
                        </div>
                        <div
                          className={`text-xs ${
                            pnl >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {pnlPercentage >= 0 ? "+" : ""}
                          {pnlPercentage.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {position.leverage || 1}x
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                            <Target className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Balance Information */}
      {balance.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="px-6 py-4 border-b border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900">
              Account Balance
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balance.map((bal) => (
                <div
                  key={bal.currency || bal.currency_short_name}
                  className="bg-gray-50/50 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {bal.currency || bal.currency_short_name}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(
                          parseFloat(bal.balance + bal.locked_balance)
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Available: {formatCurrency(parseFloat(bal.balance))}
                      </p>
                      <p className="text-sm text-gray-500">
                        Locked: {formatCurrency(parseFloat(bal.locked_balance))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions;
