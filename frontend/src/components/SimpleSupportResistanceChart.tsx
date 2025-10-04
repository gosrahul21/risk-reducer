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
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';
import { apiService } from '../services/api';

interface SimpleSupportResistanceChartProps {
  symbol: string;
  timeframe?: string;
  height?: number;
  showVolume?: boolean;
  chartType?: 'line' | 'area' | 'composed';
  lastN?: number;
}

const SimpleSupportResistanceChart: React.FC<SimpleSupportResistanceChartProps> = ({
  symbol,
  timeframe = '4h',
  height = 400,
  showVolume = true,
  chartType = 'composed',
  lastN = 10
}) => {
  const [supports, setSupports] = useState<number[]>([]);
  const [resistances, setResistances] = useState<number[]>([]);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch support/resistance data
  const fetchSupportResistance = async () => {
    try {
      const data = await apiService.getSupportResistance(symbol, timeframe);
      setSupports(data.supports || []);
      setResistances(data.resistances || []);
    } catch (err: any) {
      console.error('Error fetching support/resistance data:', err);
      setError(err.message || 'Failed to fetch support/resistance data');
    }
  };

  // Fetch current price
  const fetchCurrentPrice = async () => {
    try {
      const response = await apiService.getPrice(symbol);
      const price = response?.price || 0;
      setCurrentPrice(price);
      
      // Create mock price data for demonstration
      const mockData = Array.from({ length: 50 }, (_, i) => {
        const basePrice = price;
        const variation = (Math.random() - 0.5) * basePrice * 0.02; // 2% variation
        const mockPrice = basePrice + variation;
        const high = mockPrice * (1 + Math.random() * 0.01);
        const low = mockPrice * (1 - Math.random() * 0.01);
        
        return {
          time: new Date(Date.now() - (49 - i) * 60000).toISOString().substr(11, 8),
          price: mockPrice,
          high,
          low,
          open: mockPrice,
          close: mockPrice,
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
      setError(null);
      await Promise.all([fetchSupportResistance(), fetchCurrentPrice()]);
      setLoading(false);
    };
    
    loadData();
  }, [symbol, timeframe]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchSupportResistance();
        fetchCurrentPrice();
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const renderChart = () => {
    const commonProps = {
      data: priceData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const referenceLines = [
      ...supports.map((price, index) => (
        <ReferenceLine
          key={`support-${index}`}
          y={price}
          stroke="#10b981"
          strokeDasharray="5 5"
          strokeWidth={2}
          label={{ value: `S: ${formatPrice(price)}`, position: 'left' }}
        />
      )),
      ...resistances.map((price, index) => (
        <ReferenceLine
          key={`resistance-${index}`}
          y={price}
          stroke="#ef4444"
          strokeDasharray="5 5"
          strokeWidth={2}
          label={{ value: `R: ${formatPrice(price)}`, position: 'right' }}
        />
      ))
    ];

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
            {referenceLines}
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
            {referenceLines}
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
            {referenceLines}
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
              fetchCurrentPrice();
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
            <span>Current: {formatPrice(currentPrice)}</span>
            <span>•</span>
            <span>{timeframe}</span>
            <span>•</span>
            <span>Last {lastN} levels</span>
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
              fetchCurrentPrice();
            }}
            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Support/Resistance Levels Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Support Levels */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2" />
            Support Levels ({supports.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {supports.length === 0 ? (
              <p className="text-gray-400 text-sm">No support levels found</p>
            ) : (
              supports.map((price, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-white font-mono">
                      {formatPrice(price)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {price < currentPrice ? 'Below' : 'Above'} current
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resistance Levels */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Resistance Levels ({resistances.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {resistances.length === 0 ? (
              <p className="text-gray-400 text-sm">No resistance levels found</p>
            ) : (
              resistances.map((price, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-white font-mono">
                      {formatPrice(price)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {price > currentPrice ? 'Above' : 'Below'} current
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSupportResistanceChart;
