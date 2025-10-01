import React, { useState } from "react";
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  TrendingUp,
  TrendingDown,
  Volume2,
} from "lucide-react";
import { useWebSocketContext } from "../contexts/WebSocketContext";
import { Notification } from "../services/websocket";

const NotificationCenter: React.FC = () => {
  const { notifications, clearNotifications, isConnected } =
    useWebSocketContext();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order_update":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "stop_loss_triggered":
        return (
          <div className="flex items-center space-x-1">
            <Volume2 className="h-5 w-5 text-red-500 animate-pulse" />
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
        );
      case "strategy_alert":
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case "price_update":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "system":
        return <Info className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "order_update":
        return "border-l-green-500 bg-green-50";
      case "stop_loss_triggered":
        return "border-l-red-500 bg-red-50 animate-pulse";
      case "strategy_alert":
        return "border-l-yellow-500 bg-yellow-50";
      case "price_update":
        return "border-l-blue-500 bg-blue-50";
      case "system":
        return "border-l-gray-500 bg-gray-50";
      default:
        return "border-l-gray-300 bg-gray-50";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <Bell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
        {notifications.some((n) => n.type === "stop_loss_triggered") && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-600 rounded-full animate-ping" />
        )}
        {!isConnected && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                <span className="text-sm text-gray-500">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-sm">You'll see real-time updates here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getNotificationColor(
                      notification.type
                    )} hover:bg-gray-50 transition-colors duration-200`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        {notification.data && (
                          <div className="mt-2 text-xs text-gray-500">
                            {JSON.stringify(notification.data, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
