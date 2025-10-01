import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  RefreshCw,
  X,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Settings,
  Eye,
  Edit,
  Trash2,
  Zap,
  Activity,
  Clock,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { apiService } from "../services/api";
import { Strategy } from "../types";
import { useWebSocketContext } from "../contexts/WebSocketContext";

const Strategies: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [recentlyUpdated, setRecentlyUpdated] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // WebSocket context for real-time updates
  const { lastNotification } = useWebSocketContext();

  const [newStrategy, setNewStrategy] = useState({
    symbol: "",
    strategy: "",
    timeframe: "",
  });

  const availableStrategies = [
    {
      value: "last_support",
      label: "Last Support",
      description: "Find lower minima for support",
    },
    {
      value: "last_close",
      label: "Last Close",
      description: "Use the last close price as the stop loss",
    },
    // {
    //   value: "moving_average",
    //   label: "Moving Average",
    //   description: "SMA-based stop loss",
    // },
    // {
    //   value: "fibonacci",
    //   label: "Fibonacci",
    //   description: "Fibonacci retracement levels",
    // },
    {
      value: "pivot_points",
      label: "Pivot Points",
      description: "Pivot point analysis",
    },
  ];

  const timeframes = [
    { value: "1m", label: "1 Minute" },
    { value: "5m", label: "5 Minutes" },
    { value: "15m", label: "15 Minutes" },
    { value: "1h", label: "1 Hour" },
    { value: "4h", label: "4 Hours" },
    { value: "1d", label: "1 Day" },
  ];

  useEffect(() => {
    loadStrategies();
  }, []);

  // Handle WebSocket notifications for real-time updates
  useEffect(() => {
    if (lastNotification && lastNotification.type === "strategy_alert") {
      // Extract symbol from notification data
      const symbol = lastNotification.data?.symbol;
      if (symbol) {
        // Show toast notification
        setToastMessage(
          `Strategy updated for ${symbol}: ${lastNotification.message}`
        );

        // Auto-refresh strategies list
        loadStrategies();

        // Highlight the updated strategy
        setRecentlyUpdated((prev) => {
          if (!prev.includes(symbol)) {
            return [...prev, symbol];
          }
          return prev;
        });

        // Remove highlight after 5 seconds
        setTimeout(() => {
          setRecentlyUpdated((prev) => prev.filter((s) => s !== symbol));
        }, 5000);

        // Clear toast after 4 seconds
        setTimeout(() => {
          setToastMessage(null);
        }, 4000);
      }
    }
  }, [lastNotification]);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAllStrategies();
      const stgs = Object.keys(response.strategies).map((key: any) => ({
        symbol: key,
        ...response.strategies[key],
      }));
      setStrategies(stgs);
    } catch (err: any) {
      setError(err.message || "Failed to load strategies");
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await apiService.addStrategyStopLoss(
        newStrategy.symbol,
        newStrategy.strategy,
        newStrategy.timeframe
      );
      setShowCreateForm(false);
      setNewStrategy({ symbol: "", strategy: "", timeframe: "" });
      await loadStrategies();
    } catch (err: any) {
      setError(err.message || "Failed to create strategy");
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveStrategy = async (symbol: string) => {
    try {
      await apiService.removeStrategyStopLoss(symbol);
      await loadStrategies();
    } catch (err: any) {
      setError(err.message || "Failed to remove strategy");
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case "last_support":
        return <TrendingDown className="h-5 w-5" />;
      case "moving_average":
        return <BarChart3 className="h-5 w-5" />;
      case "fibonacci":
        return <Target className="h-5 w-5" />;
      case "pivot_points":
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case "last_support":
        return "from-blue-500 to-blue-600";
      case "moving_average":
        return "from-green-500 to-green-600";
      case "fibonacci":
        return "from-purple-500 to-purple-600";
      case "pivot_points":
        return "from-orange-500 to-orange-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const filteredStrategies = (
    Array.isArray(strategies) ? strategies : []
  ).filter((strategy) => {
    const matchesSearch =
      strategy.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      strategy.strategy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      strategyFilter === "all" || strategy.status === strategyFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Loading strategies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Trading Strategies
          </h1>
          <p className="mt-2 text-gray-600">
            Automated trading strategies and stop loss management
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={loadStrategies}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Strategy
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Strategies
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {strategies.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  (Array.isArray(strategies) ? strategies : []).filter(
                    (s) => s.status === "active"
                  ).length
                }
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Paused</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  (Array.isArray(strategies) ? strategies : []).filter(
                    (s) => s.status === "paused"
                  ).length
                }
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Success Rate
              </p>
              <p className="text-2xl font-bold text-blue-600">87.5%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search strategies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            >
              <option value="all">All Strategies</option>
              {availableStrategies.map((strategy) => (
                <option key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </option>
              ))}
            </select>
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

      {/* Create Strategy Form */}
      {showCreateForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Create New Strategy
            </h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleCreateStrategy} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symbol
                </label>
                <input
                  type="text"
                  value={newStrategy.symbol}
                  onChange={(e) =>
                    setNewStrategy({ ...newStrategy, symbol: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="BTCUSDT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strategy
                </label>
                <select
                  value={newStrategy.strategy}
                  onChange={(e) =>
                    setNewStrategy({ ...newStrategy, strategy: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                >
                  <option value="">Select Strategy</option>
                  {availableStrategies.map((strategy) => (
                    <option key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeframe
                </label>
                <select
                  value={newStrategy.timeframe}
                  onChange={(e) =>
                    setNewStrategy({
                      ...newStrategy,
                      timeframe: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                >
                  <option value="">Select Timeframe</option>
                  {timeframes.map((timeframe) => (
                    <option key={timeframe.value} value={timeframe.value}>
                      {timeframe.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition-all duration-200"
              >
                {creating ? "Creating..." : "Create Strategy"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Strategies List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        {filteredStrategies.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Target className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No strategies found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || strategyFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating a new strategy"}
              </p>
              {!searchTerm && strategyFilter === "all" && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Strategy
                </button>
              )}
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
                    Strategy
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeframe
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stop Loss Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStrategies.map((strategy) => (
                  <tr
                    key={strategy.symbol}
                    className={`hover:bg-gray-50/50 transition-all duration-500 ${
                      recentlyUpdated.includes(strategy.symbol)
                        ? "bg-green-50 border-l-4 border-l-green-500 animate-pulse"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${getStrategyColor(
                            strategy.strategy
                          )} text-white text-sm font-bold`}
                        >
                          {strategy.symbol?.slice(0, 2)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {strategy.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-gray-400 mr-2">
                          {getStrategyIcon(strategy.strategy)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {availableStrategies.find(
                              (s) => s.value === strategy.strategy
                            )?.label || strategy.strategy}
                          </div>
                          <div className="text-sm text-gray-500">
                            {
                              availableStrategies.find(
                                (s) => s.value === strategy.strategy
                              )?.description
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {strategy.timeframe}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-900">
                          {strategy.stopLossPrice
                            ? `$${strategy.stopLossPrice.toFixed(4)}`
                            : "N/A"}
                        </div>
                        {recentlyUpdated.includes(strategy.symbol) && (
                          <div className="flex items-center text-green-600">
                            <Zap className="h-4 w-4 animate-bounce" />
                            <span className="text-xs font-medium ml-1">
                              Updated
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          strategy.status === "active"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        }`}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        <span>{strategy.status || "Unknown"}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {strategy.created_at
                        ? new Date(strategy.created_at).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors duration-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-yellow-600 transition-colors duration-200">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveStrategy(strategy.symbol)}
                          className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Strategies;
