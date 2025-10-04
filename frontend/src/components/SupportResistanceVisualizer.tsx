import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
  BarChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity, 
  BarChart3,
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiService } from '../services/api';

interface SupportResistanceLevel {
  price: number;
  strength: number;
  type: string;
}

interface SupportResistanceData {
  supportLevels: SupportResistanceLevel[];
  resistanceLevels: SupportResistanceLevel[];
  currentPrice: number;
  timestamp: number;
}

interface PriceData {
  time: string;
  price: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
}

interface SupportResistanceVisualizerProps {
  symbol: string;
  timeframe?: string;
  height?: number;
  showVolume?: boolean;
  chartTypeDefault?: 'line' | 'area' | 'candlestick' | 'composed';
}

const SupportResistanceVisualizer: React.FC<SupportResistanceVisualizerProps> = ({
  symbol,
  timeframe = '4h',
  height = 400,
  showVolume = true,
  chartTypeDefault = 'composed'
}) => {
  const [srData, setSrData] = useState<SupportResistanceData | null>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSupport, setShowSupport] = useState(true);
  const [showResistance, setShowResistance] = useState(true);
  const [showLevels, setShowLevels] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [chartType, setChartType] = useState<'line' | 'area' | 'candlestick' | 'composed'>(chartTypeDefault);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch support/resistance data
  const fetchSupportResistance = async () => {
    try {
      const response = await apiService.get(`/technical/support-resistance/${symbol}/${timeframe}`);
      const data = response.data || response;
      
      // Transform the simplified API response to match our UI expectations
      const transformedData = {
        supportLevels: data.supports.map((price: number) => ({
          price,
          strength: 0.7, // Default strength for simple levels
          type: 'Price Action'
        })),
        resistanceLevels: data.resistances.map((price: number) => ({
          price,
          strength: 0.7, // Default strength for simple levels
          type: 'Price Action'
        })),
        currentPrice: 0, // Will be updated from price data
        timestamp: Date.now()
      };
      
      setSrData(transformedData);
    } catch (err: any) {
      console.error('Error fetching support/resistance data:', err);
      setError(err.message || 'Failed to fetch support/resistance data');
    }
  };

  // Fetch price data for chart
  const fetchPriceData = async () => {
    try {
      const response = await apiService.get(`/price/${symbol}`);
      const currentPrice = response.data?.price || response.price || 0;
      const timestamp = new Date().toISOString();
      
      // Update current price in support/resistance data
      if (srData) {
        setSrData(prev => prev ? { ...prev, currentPrice } : null);
      }
      
      // Create mock price data for demonstration
      // In real implementation, you'd fetch historical data
      const mockData: PriceData[] = Array.from({ length: 50 }, (_, i) => {
        const basePrice = currentPrice;
        const variation = (Math.random() - 0.5) * basePrice * 0.02; // 2% variation
        const price = basePrice + variation;
        const high = price * (1 + Math.random() * 0.01);
        const low = price * (1 - Math.random() * 0.01);
        
        return {
          time: new Date(Date.now() - (49 - i) * 60000).toISOString().substr(11, 8),
          price,
          high,
          low,
          open: price,
          close: price,
          volume: Math.random() * 1000000
        };
      });
      
      setPriceData(mockData);
    } catch (err: any) {
      console.error('Error fetching price data:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSupportResistance(), fetchPriceData()]);
      setLoading(false);
    };
    
    loadData();
  }, [symbol, timeframe]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchSupportResistance();
        fetchPriceData();
      }, refreshInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, symbol, timeframe]);

  // WebSocket integration for real-time updates
  useEffect(() => {
    // This would integrate with your existing WebSocket context
    // For now, we'll use polling
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.8) return '#ef4444'; // Red for strong
    if (strength >= 0.6) return '#f97316'; // Orange for medium
    return '#eab308'; // Yellow for weak
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 0.8) return 'Strong';
    if (strength >= 0.6) return 'Medium';
    return 'Weak';
  };

  const renderChart = () => {
    const commonProps = {
      data: priceData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
            />
            {showSupport && srData?.supportLevels.map((level, index) => (
              <ReferenceLine
                key={`support-${index}`}
                y={level.price}
                stroke={getStrengthColor(level.strength)}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: `S: ${formatPrice(level.price)}`, position: 'left' }}
              />
            ))}
            {showResistance && srData?.resistanceLevels.map((level, index) => (
              <ReferenceLine
                key={`resistance-${index}`}
                y={level.price}
                stroke={getStrengthColor(level.strength)}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: `R: ${formatPrice(level.price)}`, position: 'right' }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              fill="url(#colorGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            {showSupport && srData?.supportLevels.map((level, index) => (
              <ReferenceLine
                key={`support-${index}`}
                y={level.price}
                stroke={getStrengthColor(level.strength)}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: `S: ${formatPrice(level.price)}`, position: 'left' }}
              />
            ))}
            {showResistance && srData?.resistanceLevels.map((level, index) => (
              <ReferenceLine
                key={`resistance-${index}`}
                y={level.price}
                stroke={getStrengthColor(level.strength)}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: `R: ${formatPrice(level.price)}`, position: 'right' }}
              />
            ))}
          </AreaChart>
        );

      case 'composed':
      default:
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              fill="url(#colorGradient)"
              strokeWidth={2}
            />
            {showVolume && (
              <Bar dataKey="volume" fill="#6b7280" opacity={0.3} />
            )}
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            {showSupport && srData?.supportLevels.map((level, index) => (
              <ReferenceLine
                key={`support-${index}`}
                y={level.price}
                stroke={getStrengthColor(level.strength)}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: `S: ${formatPrice(level.price)}`, position: 'left' }}
              />
            ))}
            {showResistance && srData?.resistanceLevels.map((level, index) => (
              <ReferenceLine
                key={`resistance-${index}`}
                y={level.price}
                stroke={getStrengthColor(level.strength)}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: `R: ${formatPrice(level.price)}`, position: 'right' }}
              />
            ))}
          </ComposedChart>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-gray-400">Loading support/resistance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-center">
          <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-2">Error loading data</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchSupportResistance();
              fetchPriceData();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-white">
              Support & Resistance - {symbol}
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Current: {srData ? formatPrice(srData.currentPrice) : 'N/A'}</span>
            <span>•</span>
            <span>{timeframe}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => {
              fetchSupportResistance();
              fetchPriceData();
            }}
            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showSupport}
              onChange={(e) => setShowSupport(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <TrendingDown className="h-4 w-4 text-green-500" />
            <span>Support Levels</span>
          </label>
          
          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showResistance}
              onChange={(e) => setShowResistance(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <TrendingUp className="h-4 w-4 text-red-500" />
            <span>Resistance Levels</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="px-3 py-1 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
            <option value="composed">Composed Chart</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Support/Resistance Levels Info */}
      {showLevels && srData && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Support Levels */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
              <TrendingDown className="h-5 w-5 mr-2" />
              Support Levels
            </h4>
            <div className="space-y-2">
              {srData.supportLevels.map((level, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStrengthColor(level.strength) }}
                    />
                    <span className="text-white font-mono">
                      {formatPrice(level.price)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>{level.type}</span>
                    <span>•</span>
                    <span className={getStrengthColor(level.strength)}>
                      {getStrengthLabel(level.strength)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resistance Levels */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Resistance Levels
            </h4>
            <div className="space-y-2">
              {srData.resistanceLevels.map((level, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStrengthColor(level.strength) }}
                    />
                    <span className="text-white font-mono">
                      {formatPrice(level.price)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>{level.type}</span>
                    <span>•</span>
                    <span className={getStrengthColor(level.strength)}>
                      {getStrengthLabel(level.strength)}
                    </span>
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

export default SupportResistanceVisualizer;
