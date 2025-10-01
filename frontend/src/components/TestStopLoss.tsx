import React from "react";
import { useWebSocketContext } from "../contexts/WebSocketContext";
import { SoundUtils } from "../utils/soundUtils";

const TestStopLoss: React.FC = () => {
  const { isConnected, notifications, setNotifications } =
    useWebSocketContext();

  const testStopLossNotification = () => {
    // Simulate a stop loss notification for testing
    const mockNotification = {
      id: `test-${Date.now()}`,
      type: "stop_loss_triggered" as const,
      title: "Stop Loss Triggered",
      message: "BTCUSDT stop loss triggered at $45,000 (stop: $44,500)",
      timestamp: Date.now(),
      data: {
        symbol: "BTCUSDT",
        price: 45000,
        stopLossPrice: 44500,
      },
    };

    // Add to notifications and play sound
    setNotifications((prev) => [mockNotification, ...prev.slice(0, 49)]);
    SoundUtils.playNotificationSound(mockNotification.type);
  };

  const testHornSound = () => {
    SoundUtils.playHornSound();
  };

  const testBeepSound = () => {
    SoundUtils.playBeepSound();
  };

  if (!isConnected) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          WebSocket not connected. Cannot test stop loss notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">
        Test Stop Loss Notifications
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={testStopLossNotification}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Test Stop Loss Notification
        </button>
        <button
          onClick={testHornSound}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Test Horn Sound
        </button>
        <button
          onClick={testBeepSound}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Test Beep Sound
        </button>
      </div>
      <p className="text-sm text-gray-600">
        Use these buttons to test the stop loss notification system and sound
        effects.
      </p>
    </div>
  );
};

export default TestStopLoss;
