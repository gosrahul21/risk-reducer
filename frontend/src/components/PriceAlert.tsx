import React, { useState, useEffect } from "react";
import { PriceAlert as PriceAlertType, PriceAlertType as AlertType } from "../types";
import { apiService } from "../services/api";
import { useWebSocketContext } from "../contexts/WebSocketContext";

interface PriceAlertProps {
  symbol?: string;
  currentPrice?: number;
}

export const PriceAlert: React.FC<PriceAlertProps> = ({ symbol = "", currentPrice = 0 }) => {
  const [alerts, setAlerts] = useState<PriceAlertType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: symbol,
    price: currentPrice,
    type: AlertType.GREATER_THAN,
    count: 1,
  });

  const { getPrice } = useWebSocketContext();

  // Load existing alerts
  useEffect(() => {
    loadAlerts();
  }, []);

  // Update current price when symbol changes
  useEffect(() => {
    if (symbol) {
      const price = getPrice(symbol);
      if (price > 0) {
        setFormData(prev => ({ ...prev, symbol, price }));
      }
    }
  }, [symbol, getPrice]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const alertsData = await apiService.getPriceAlerts();
      setAlerts(alertsData.priceAlerts);
    } catch (err: any) {
      setError(err.message || "Failed to load price alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.price) {
      setError("Symbol and price are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await apiService.createPriceAlert(
        formData.symbol.toUpperCase(),
        formData.price,
        formData.type,
        formData.count
      );
      
      // Reset form
      setFormData({
        symbol: symbol,
        price: currentPrice,
        type: AlertType.GREATER_THAN,
        count: 1,
      });
      setShowForm(false);
      
      // Reload alerts
      await loadAlerts();
    } catch (err: any) {
      setError(err.message || "Failed to create price alert");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (alertSymbol: string) => {
    try {
      setLoading(true);
      await apiService.removePriceAlert(alertSymbol);
      await loadAlerts();
    } catch (err: any) {
      setError(err.message || "Failed to remove price alert");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(4);
  };

  const getAlertTypeText = (type: AlertType) => {
    return type === AlertType.GREATER_THAN ? "Above" : "Below";
  };

  const getAlertStatus = (alert: PriceAlertType) => {
    const currentPrice = getPrice(alert.symbol);
    if (currentPrice === 0) return "Unknown";
    
    if (alert.type === AlertType.GREATER_THAN) {
      return currentPrice >= alert.price ? "Triggered" : "Active";
    } else {
      return currentPrice <= alert.price ? "Triggered" : "Active";
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case "Triggered":
        return "text-red-600 bg-red-100";
      case "Active":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Price Alerts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {showForm ? "Cancel" : "Add Alert"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symbol
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., BTCUSDT"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AlertType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={AlertType.GREATER_THAN}>Above Price</option>
                <option value={AlertType.LESS_THAN}>Below Price</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Count (Times to Trigger)
              </label>
              <input
                type="number"
                min="1"
                value={formData.count}
                onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
            >
              {loading ? "Creating..." : "Create Alert"}
            </button>
          </div>
        </form>
      )}

      {loading && !showForm && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading alerts...</p>
        </div>
      )}

      {alerts.length === 0 && !loading && !showForm && (
        <div className="text-center py-8 text-gray-500">
          <p>No price alerts set up yet.</p>
          <p className="text-sm">Click "Add Alert" to create your first price alert.</p>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const status = getAlertStatus(alert);
            const currentPrice = getPrice(alert.symbol);
            
            return (
              <div
                key={`${alert.symbol}-${index}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{alert.symbol}</h3>
                      <p className="text-sm text-gray-600">
                        Alert when price is {getAlertTypeText(alert.type)} ${formatPrice(alert.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Current Price</p>
                      <p className="font-medium">
                        {currentPrice > 0 ? `$${formatPrice(currentPrice)}` : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Count</p>
                      <p className="font-medium">{alert.count}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertStatusColor(status)}`}
                  >
                    {status}
                  </span>
                  <button
                    onClick={() => handleRemove(alert.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 disabled:text-red-400 transition-colors"
                    title="Remove alert"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PriceAlert;
