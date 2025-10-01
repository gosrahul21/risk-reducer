import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Star,
  Activity,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { apiService } from "../services/api";
import { useWebSocketContext } from "../contexts/WebSocketContext";

const Prices: React.FC = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const { prices: realTimePrices, isConnected } = useWebSocketContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"symbol" | "price" | "change">("symbol");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (Object.keys(realTimePrices).length > 0) {
      const newPrices: Record<string, number> = {};
      Object.values(realTimePrices).forEach((priceUpdate) => {
        newPrices[priceUpdate.symbol] = priceUpdate.price;
      });
      setPrices((prev) => ({ ...prev, ...newPrices }));
    }
  }, [realTimePrices]);

  const loadPrices = async () => {
    try {
      setError(null);
      const response = await apiService.getAllPrices();
      setPrices(response.prices || {});
    } catch (err: any) {
      setError(err.message || "Failed to load prices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadPrices();
    }
  }, [isConnected]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const getPriceChange = (symbol: string, price: number) => {
    // Mock price change for demonstration
    const changes: Record<string, number> = {
      BTCUSDT: 2.34,
      ETHUSDT: -1.23,
      SOLUSDT: 5.67,
      SUIUSDT: -0.89,
      PAXGUSDT: 1.45,
    };
    return changes[symbol] || (Math.random() - 0.5) * 10;
  };

  const filteredAndSortedPrices = Object.entries(prices)
    .filter(([symbol]) =>
      symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(([a, aPrice], [b, bPrice]) => {
      let comparison = 0;

      switch (sortBy) {
        case "symbol":
          comparison = a.localeCompare(b);
          break;
        case "price":
          comparison = aPrice - bPrice;
          break;
        case "change":
          comparison = getPriceChange(a, aPrice) - getPriceChange(b, bPrice);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Loading market prices...</p>
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
            Market Prices
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time cryptocurrency prices and market data
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <Activity className="h-4 w-4 animate-pulse" />
            <span className="font-medium">Live</span>
          </div>
          <button
            onClick={loadPrices}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "symbol" | "price" | "change")
              }
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="symbol">Sort by Symbol</option>
              <option value="price">Sort by Price</option>
              <option value="change">Sort by Change</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
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

      {/* Prices Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAndSortedPrices.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No prices found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Market data will appear here"}
              </p>
            </div>
          </div>
        ) : (
          filteredAndSortedPrices.map(([symbol, price]) => {
            const change = getPriceChange(symbol, price);
            const isPositive = change >= 0;

            return (
              <div
                key={symbol}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold shadow-lg">
                      {symbol.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {symbol}
                      </h3>
                      <p className="text-sm text-gray-500">Cryptocurrency</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="text-gray-400 hover:text-yellow-500 transition-colors duration-200">
                      <Star className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(price)}
                    </p>
                    <div
                      className={`flex items-center text-sm ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      <span className="font-medium">
                        {isPositive ? "+" : ""}
                        {change.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        <span>Live</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200">
                        Trade
                      </button>
                      <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                        Chart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Market Summary */}
      {Object.keys(prices).length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Market Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white mx-auto mb-2">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="text-sm text-gray-600">Total Pairs</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(prices).length}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white mx-auto mb-2">
                <BarChart3 className="h-6 w-6" />
              </div>
              <p className="text-sm text-gray-600">Market Cap</p>
              <p className="text-2xl font-bold text-gray-900">$2.1T</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white mx-auto mb-2">
                <Zap className="h-6 w-6" />
              </div>
              <p className="text-sm text-gray-600">24h Volume</p>
              <p className="text-2xl font-bold text-gray-900">$89.2B</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prices;
