import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  websocketService,
  PriceUpdate,
  Notification,
} from "../services/websocket";
import { SoundUtils } from "../utils/soundUtils";

interface WebSocketContextType {
  isConnected: boolean;
  prices: Record<string, PriceUpdate>;
  notifications: Notification[];
  lastPriceUpdate: PriceUpdate | null;
  lastNotification: Notification | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearNotifications: () => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  getPrice: (symbol: string) => number;
  getPriceUpdate: (symbol: string) => PriceUpdate | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<PriceUpdate | null>(
    null
  );
  const [lastNotification, setLastNotification] = useState<Notification | null>(
    null
  );

  const connect = async (): Promise<void> => {
    try {
      await websocketService.connect();
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
    }
  };

  const disconnect = (): void => {
    websocketService.disconnect();
  };

  const clearNotifications = (): void => {
    setNotifications([]);
  };

  const getPrice = (symbol: string): number => {
    const priceUpdate = prices[symbol];
    return priceUpdate?.price || 0;
  };

  const getPriceUpdate = (symbol: string): PriceUpdate | null => {
    return prices[symbol] || null;
  };

  useEffect(() => {
    // Set up connection status listener
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
    };

    // Set up price update listener
    const handlePriceUpdate = (price: PriceUpdate) => {
      setPrices((prev) => ({
        ...prev,
        [price.symbol]: price,
      }));
      setLastPriceUpdate(price);
    };

    // Set up notification listener
    const handleNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
      setLastNotification(notification);

      // Play sound for important notifications
      if (notification.type === "stop_loss_triggered" || notification.type === "price_alert") {
        SoundUtils.playNotificationSound(notification.type);
      }
    };

    // Subscribe to events
    websocketService.onConnectionChange(handleConnectionChange);
    websocketService.onPriceUpdate(handlePriceUpdate);
    websocketService.onNotification(handleNotification);

    // Start heartbeat
    websocketService.startHeartbeat();

    // Connect on mount
    connect();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    prices,
    notifications,
    lastPriceUpdate,
    lastNotification,
    connect,
    disconnect,
    clearNotifications,
    setNotifications,
    getPrice,
    getPriceUpdate,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};

// Export the context for direct access if needed
export { WebSocketContext };
