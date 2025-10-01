import React from "react";
import { Zap } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200`}
        ></div>
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-blue-600 border-t-transparent absolute top-0 left-0`}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="h-4 w-4 text-blue-600 animate-pulse" />
        </div>
      </div>
      <p className="text-gray-500 text-sm font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

