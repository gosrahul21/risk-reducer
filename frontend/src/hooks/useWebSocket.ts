import { useEffect, useState, useCallback } from "react";
import {
  websocketService,
  PriceUpdate,
  Notification,
} from "../services/websocket";
import { SoundUtils } from "../utils/soundUtils";

export interface UseWebSocketReturn {
  isConnected: boolean;
  prices: Record<string, PriceUpdate>;
  notifications: Notification[];
  lastPriceUpdate: PriceUpdate | null;
  lastNotification: Notification | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearNotifications: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<PriceUpdate | null>(
    null
  );
  const [lastNotification, setLastNotification] = useState<Notification | null>(
    null
  );

  const connect = useCallback(async () => {
    try {
      await websocketService.connect();
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

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

      // Play sound for stop loss notifications
      if (notification.type === "stop_loss_triggered") {
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
  }, [connect]);

  return {
    isConnected,
    prices,
    notifications,
    lastPriceUpdate,
    lastNotification,
    connect,
    disconnect,
    clearNotifications,
  };
};
