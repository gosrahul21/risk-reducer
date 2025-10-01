import React, { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  RefreshCw,
  X,
  AlertTriangle,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Settings,
  Eye,
  Edit,
  Trash2,
  Zap,
  Activity,
} from "lucide-react";
import { apiService } from "../services/api";
import { StopLoss as StopLossType } from "../types";

const StopLoss: React.FC = () => {
  const [stopLosses, setStopLosses] = useState<StopLossType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [newStopLoss, setNewStopLoss] = useState({
    symbol: "",
    price: 0,
    quantity: 0,
    side: "sell" as "buy" | "sell",
  });

  useEffect(() => {
    loadStopLosses();
  }, []);

  const loadStopLosses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAllStopLosses();
      setStopLosses(response.stopLosses);
    } catch (err: any) {
      setError(err.message || "Failed to load stop losses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStopLoss = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await apiService.setStopLoss(newStopLoss.symbol, newStopLoss.price);
      setShowCreateForm(false);
      setNewStopLoss({ symbol: "", price: 0, quantity: 0, side: "sell" });
      await loadStopLosses();
    } catch (err: any) {
      setError(err.message || "Failed to create stop loss");
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveStopLoss = async (symbol: string) => {
    try {
      await apiService.removeStopLoss(symbol);
      await loadStopLosses();
    } catch (err: any) {
      setError(err.message || "Failed to remove stop loss");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "triggered":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Shield className="h-4 w-4" />;
      case "triggered":
        return <AlertTriangle className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const filteredStopLosses = stopLosses.filter((stopLoss) => {
    const matchesSearch = stopLoss.symbol
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      stopLoss.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Loading stop losses...</p>
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
            Stop Loss Management
          </h1>
          <p className="mt-2 text-gray-600">
            Protect your positions with automated stop loss orders
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={loadStopLosses}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Stop Loss
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Stop Losses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stopLosses.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-pink-600 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {stopLosses.filter((sl) => sl.status === "active").length}
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
              <p className="text-sm font-medium text-gray-600 mb-1">
                Triggered
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stopLosses.filter((sl) => sl.status === "triggered").length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Protected Value
              </p>
              <p className="text-2xl font-bold text-gray-900">$0</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
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
                placeholder="Search stop losses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="triggered">Triggered</option>
              <option value="cancelled">Cancelled</option>
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

      {/* Create Stop Loss Form */}
      {showCreateForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Create New Stop Loss
            </h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleCreateStopLoss} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symbol
                </label>
                <input
                  type="text"
                  value={newStopLoss.symbol}
                  onChange={(e) =>
                    setNewStopLoss({ ...newStopLoss, symbol: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="BTCUSDT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Side
                </label>
                <select
                  value={newStopLoss.side}
                  onChange={(e) =>
                    setNewStopLoss({
                      ...newStopLoss,
                      side: e.target.value as "buy" | "sell",
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                >
                  <option value="sell">Sell (Long Position)</option>
                  <option value="buy">Buy (Short Position)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stop Loss Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newStopLoss.price || ""}
                  onChange={(e) =>
                    setNewStopLoss({
                      ...newStopLoss,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="45000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={newStopLoss.quantity || ""}
                  onChange={(e) =>
                    setNewStopLoss({
                      ...newStopLoss,
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="0.001"
                />
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
                className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-200"
              >
                {creating ? "Creating..." : "Create Stop Loss"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stop Losses List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        {filteredStopLosses.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Shield className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No stop losses found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating a new stop loss"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Stop Loss
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
                    Side
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stop Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
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
                {filteredStopLosses.map((stopLoss) => (
                  <tr
                    key={stopLoss.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-bold">
                          {stopLoss.symbol?.slice(0, 2)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {stopLoss.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`flex items-center ${
                          stopLoss.side === "buy"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stopLoss.side === "buy" ? (
                          <TrendingUp className="h-4 w-4 mr-2" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-2" />
                        )}
                        <span className="text-sm font-medium">
                          {stopLoss.side?.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatPrice(stopLoss.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {stopLoss.quantity || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          stopLoss.status || ""
                        )}`}
                      >
                        {getStatusIcon(stopLoss.status || "")}
                        <span className="ml-1">
                          {stopLoss.status || "Unknown"}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stopLoss.created_at
                        ? new Date(stopLoss.created_at).toLocaleString()
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
                          onClick={() => handleRemoveStopLoss(stopLoss.symbol!)}
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

export default StopLoss;
