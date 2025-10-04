import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  RefreshCw,
  X,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  MoreVertical,
  Zap,
} from "lucide-react";
import { apiService } from "../services/api";
import { Order } from "../types";
import { useWebSocketContext } from "../contexts/WebSocketContext";

// Add custom CSS for the slider
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tokenSearchTerm, setTokenSearchTerm] = useState("");
  const [percentage, setPercentage] = useState(10); // Default to 10%
  const [walletBalance, setWalletBalance] = useState(0);
  // const [currentPrice, setCurrentPrice] = useState(0);
  const [calculatedQuantity, setCalculatedQuantity] = useState(0);

  const { prices, getPrice } = useWebSocketContext();

  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    side: "buy",
    pair: "B-BTC_USDT",
    order_type: "limit_order",
    margin_currency_short_name: "USDT",
    leverage: 1,
    total_quantity: 0.001,
  });

  const currentPrice = useMemo(() => {
    if (!newOrder.pair) return 0;
    const symbol = newOrder.pair.replace("B-", "").split("_")[0] + "USDT";
    return getPrice(symbol);
  }, [prices, newOrder.pair, getPrice]);

  console.log(currentPrice);

  const [selectedCurrency, setSelectedCurrency] = useState<"USDT" | "INR">(
    "USDT"
  );

  useEffect(() => {
    if (
      newOrder.order_type === "limit_order" &&
      newOrder.price &&
      walletBalance &&
      currentPrice
    ) {
      calculateQuantity(walletBalance, newOrder.price || 0);
    } else if (newOrder.order_type === "market_order" && walletBalance) {
      calculateQuantity(walletBalance, currentPrice || 0);
    }
  }, [newOrder.order_type, newOrder.price, walletBalance, currentPrice]);

  // Available trading pairs based on currency
  const availableTokens = {
    USDT: [
      { symbol: "B-BTC_USDT", name: "Bitcoin", icon: "₿" },
      { symbol: "B-ETH_USDT", name: "Ethereum", icon: "Ξ" },
      { symbol: "B-SOL_USDT", name: "Solana", icon: "◎" },
      { symbol: "B-SUI_USDT", name: "Sui", icon: "SUI" },
      { symbol: "B-ADA_USDT", name: "Cardano", icon: "₳" },
      { symbol: "B-DOT_USDT", name: "Polkadot", icon: "●" },
      { symbol: "B-MATIC_USDT", name: "Polygon", icon: "⬟" },
      { symbol: "B-AVAX_USDT", name: "Avalanche", icon: "🔺" },
      { symbol: "B-LINK_USDT", name: "Chainlink", icon: "🔗" },
      { symbol: "B-UNI_USDT", name: "Uniswap", icon: "🦄" },
    ],
    INR: [
      { symbol: "B-BTC_USDT", name: "Bitcoin", icon: "₿" },
      { symbol: "B-ETH_USDT", name: "Ethereum", icon: "Ξ" },
      { symbol: "B-SOL_USDT", name: "Solana", icon: "◎" },
      { symbol: "B-SUI_USDT", name: "Sui", icon: "SUI" },
      { symbol: "B-ADA_USDT", name: "Cardano", icon: "₳" },
      { symbol: "B-DOT_USDT", name: "Polkadot", icon: "●" },
      { symbol: "B-MATIC_USDT", name: "Polygon", icon: "⬟" },
      { symbol: "B-AVAX_USDT", name: "Avalanche", icon: "🔺" },
      { symbol: "B-LINK_USDT", name: "Chainlink", icon: "🔗" },
      { symbol: "B-UNI_USDT", name: "Uniswap", icon: "🦄" },
    ],
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Fetch wallet balance and current price when form opens
  // useEffect(() => {
  //   if (showCreateForm) {
  //     fetchWalletData();
  //   }
  // }, [showCreateForm]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getOrders();
      setOrders(response || []);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // loadOrders();
    if (showCreateForm && selectedCurrency) {
      fetchWalletData();
    }
  }, [selectedCurrency, showCreateForm]);

  const fetchWalletData = async () => {
    try {
      // Fetch wallet balance
      const balanceResponse = await apiService.getBalance();
      const balances = balanceResponse || [];

      // Find the balance for the selected currency
      const currencyBalance = balances.find(
        (bal: any) => bal.currency_short_name === selectedCurrency
      );

      if (currencyBalance) {
        const balance = parseFloat(currencyBalance.balance || "0");
        setWalletBalance(balance);
      }
    } catch (err: any) {
      console.error("Failed to fetch wallet data:", err);
      setError("Failed to fetch wallet balance or current price");
    }
  };

  const calculateQuantity = (balance: number, price: number) => {
    if (price <= 0) return;

    // Convert INR to USDT if needed (1 USDT = 93 INR)
    let usdtAmount = balance;
    if (selectedCurrency === "INR") {
      usdtAmount = balance / 93;
    }

    const totalMaxQty = (usdtAmount / price) * (newOrder.leverage || 1);
    const totalQty = (totalMaxQty * percentage) / 100;

    setCalculatedQuantity(totalQty);

    // Update the order with calculated quantity
    setNewOrder((prev) => ({
      ...prev,
      total_quantity: totalQty,
    }));
  };

  const handlePercentageChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    // calculateQuantity(walletBalance, currentPrice);
  };

  const handleCreateOrder = async (side: "buy" | "sell") => {
    try {
      setCreating(true);
      const orderData = {
        ...newOrder,
        side: side,
        margin_currency_short_name: selectedCurrency,
        pair: newOrder.pair, // Use the selected pair from dropdown
        total_quantity: parseFloat(newOrder.total_quantity?.toFixed(1)!) || 0,
      };
      await apiService.createOrder(orderData);
      setShowCreateForm(false);
      // Reset to default values
      setNewOrder({
        side: "buy",
        pair: "B-BTC_USDT",
        order_type: "limit_order",
        margin_currency_short_name: "USDT",
        leverage: 1,
        total_quantity: 0.001,
      });
      setSelectedCurrency("USDT");
      setTokenSearchTerm("");
      await loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to create order");
    } finally {
      setCreating(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await apiService.cancelOrder(orderId);
      await loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to cancel order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "filled":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "filled":
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
      case "open":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
      case "rejected":
        return <X className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  // Filter tokens based on search term
  const filteredTokens = availableTokens[selectedCurrency].filter(
    (token) =>
      token.name.toLowerCase().includes(tokenSearchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(tokenSearchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.pair?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.side?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      order.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <style>{sliderStyles}</style>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Orders
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your trading orders and monitor execution
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={loadOrders}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="filled">Filled</option>
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

      {/* Create Order Form */}
      {showCreateForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Create New Order
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchWalletData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Refresh wallet data and prices"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setTokenSearchTerm("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <form
            onSubmit={(e) => handleCreateOrder("buy")}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Side
                </label>
                <select
                  value={newOrder.side}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      side: e.target.value as "buy" | "sell",
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => {
                    const currency = e.target.value as "USDT" | "INR";
                    setSelectedCurrency(currency);
                    // Reset to first available token for the selected currency
                    const firstToken = availableTokens[currency][0];
                    setNewOrder({
                      ...newOrder,
                      margin_currency_short_name: currency,
                      pair: firstToken.symbol,
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="USDT">USDT</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Token
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search tokens..."
                    value={tokenSearchTerm}
                    onChange={(e) => setTokenSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  />
                  <select
                    value={newOrder.pair}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, pair: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    size={Math.min(filteredTokens.length, 6)}
                  >
                    {filteredTokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.icon} {token.name} ({token.symbol})
                      </option>
                    ))}
                  </select>
                  {filteredTokens.length === 0 && tokenSearchTerm && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No tokens found matching "{tokenSearchTerm}"
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type
                </label>
                <select
                  value={newOrder.order_type}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      order_type: e.target.value as
                        | "market_order"
                        | "limit_order",
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="market_order">Market Order</option>
                  <option value="limit_order">Limit Order</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Percentage
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">0%</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {percentage}%
                    </span>
                    <span className="text-sm text-gray-600">100%</span>
                  </div>
                  <div className="flex space-x-2">
                    {[10, 25, 50, 75, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePercentageChange(preset)}
                        className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                          percentage === preset
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) =>
                      handlePercentageChange(parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>
                        Wallet Balance: {walletBalance.toFixed(2)}{" "}
                        {selectedCurrency}
                      </span>
                      <span>
                        ≈ {((walletBalance * percentage) / 100).toFixed(2)}{" "}
                        {selectedCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Current Price: ${currentPrice.toFixed(2)}</span>
                      <span className="font-medium">
                        Quantity: {calculatedQuantity.toFixed(8)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Quantity (Auto-calculated)
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={calculatedQuantity || ""}
                  onChange={(e) => {
                    const quantity = parseFloat(e.target.value) || 0;
                    setCalculatedQuantity(quantity);
                    setNewOrder({
                      ...newOrder,
                      total_quantity: quantity,
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  placeholder="0.001"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This field is auto-calculated based on your percentage
                  selection
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (for limit orders)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newOrder.price || ""}
                  disabled={newOrder.order_type !== "limit_order"}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      price: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="disabled:opacity-50 disabled:cursor-not-allowed w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="45000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leverage
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newOrder.leverage || 1}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      leverage: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setTokenSearchTerm("");
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                onClick={() => handleCreateOrder("buy")}
                className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
              >
                {creating ? "Creating..." : "Create Buy Order"}
              </button>
              <button
                type="submit"
                disabled={creating}
                onClick={() => handleCreateOrder("sell")}
                className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
              >
                {creating ? "Creating..." : "Create Sell Order"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating a new order"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
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
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
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
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {order.side?.toUpperCase()} {order.pair}
                          </div>
                          <div className="text-sm text-gray-500">
                            Leverage: {order.leverage}x
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.order_type?.replace("_", " ").toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.margin_currency_short_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.total_quantity}
                      </div>
                      <div className="text-sm text-gray-500">
                        Remaining: {order.remaining_quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatPrice(order.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Fee: {order.taker_fee}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status || ""
                        )}`}
                      >
                        {getStatusIcon(order.status || "")}
                        <span className="ml-1">
                          {order.status || "Unknown"}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        {order.status === "open" && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-red-400 hover:text-red-600 transition-colors duration-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <MoreVertical className="h-4 w-4" />
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

export default Orders;
