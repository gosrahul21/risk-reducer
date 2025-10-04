import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import SimpleSupportResistanceChart from '../components/SimpleSupportResistanceChart';
import { useWebSocket } from '../hooks/useWebSocket';

const TechnicalAnalysis: React.FC = () => {
  const { prices: realTimePrices, isConnected } = useWebSocket();
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('4h');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [chartType, setChartType] = useState<'line' | 'area' | 'composed'>('composed');

  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'SUIUSDT', 'PAXGUSDDT'];
  const timeframes = ['1h', '4h', '1d'];

  // Listen for real-time support/resistance updates
  useEffect(() => {
    // This would integrate with your WebSocket context to listen for support_resistance_update messages
    // For now, we'll simulate real-time updates
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const getPriceChange = (symbol: string) => {
    const priceUpdate = Object.values(realTimePrices).find(
      (update: any) => update.symbol === symbol
    );
    return priceUpdate ? priceUpdate.price : 0;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3" />
              Technical Analysis
            </h1>
            <p className="text-blue-100 text-lg">
              Real-time support and resistance level analysis
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
                {isConnected ? "Live Analysis" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Symbol:</label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {symbols.map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Timeframe:</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {timeframes.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showAdvanced
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Advanced</span>
            </button>
          </div>
        </div>

        {/* Advanced Controls */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showVolume"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showVolume" className="text-sm text-gray-700">
                  Show Volume
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showLevels"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showLevels" className="text-sm text-gray-700">
                  Show Level Details
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                  Auto Refresh
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Chart Type:</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                  className="px-2 py-1 text-sm bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="line">Line</option>
                  <option value="area">Area</option>
                  <option value="composed">Composed</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Price Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {getPriceChange(selectedSymbol) ? formatPrice(getPriceChange(selectedSymbol)) : 'N/A'}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+2.1% (24h)</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Support Levels</p>
              <p className="text-2xl font-bold text-green-600">5</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Strong levels detected</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Resistance Levels</p>
              <p className="text-2xl font-bold text-red-600">4</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-pink-600 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>Key levels ahead</span>
          </div>
        </div>
      </div>

      {/* Main Visualizer */}
      <SimpleSupportResistanceChart
        symbol={selectedSymbol}
        timeframe={selectedTimeframe}
        height={500}
        showVolume={true}
        chartType={chartType}
        lastN={10}
      />

      {/* Analysis Summary */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
          Analysis Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Key Support Levels</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Strong support at $42,500 (Pivot Point)</li>
              <li>• Secondary support at $41,800 (Fibonacci)</li>
              <li>• Critical support at $40,000 (Price Action)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Key Resistance Levels</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Immediate resistance at $44,200 (Pivot Point)</li>
              <li>• Strong resistance at $45,500 (Price Action)</li>
              <li>• Major resistance at $47,000 (Fibonacci)</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Analysis:</strong> The current price is trading between key support and resistance levels. 
            A break above $44,200 could signal bullish momentum, while a break below $42,500 
            could indicate bearish pressure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysis;
