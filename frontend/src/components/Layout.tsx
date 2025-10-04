import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  Menu,
  Settings,
  Shield,
  TrendingUp,
  X,
  Zap,
  Activity,
  Wallet,
  Target,
  Bell,
} from "lucide-react";
import NotificationCenter from "./NotificationCenter";

import { useWebSocketContext } from "../contexts/WebSocketContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Orders",
      href: "/orders",
      icon: CreditCard,
      color: "from-green-500 to-green-600",
    },
    {
      name: "Positions",
      href: "/positions",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Stop Loss",
      href: "/stoploss",
      icon: Shield,
      color: "from-red-500 to-red-600",
    },
    {
      name: "Strategies",
      href: "/strategies",
      icon: Target,
      color: "from-orange-500 to-orange-600",
    },
    {
      name: "Prices",
      href: "/prices",
      icon: DollarSign,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      name: "Price Alerts",
      href: "/price-alerts",
      icon: Bell,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      name: "Technical Analysis",
      href: "/technical-analysis",
      icon: BarChart3,
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative flex w-72 flex-1 flex-col bg-white/95 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex flex-shrink-0 items-center px-6 py-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  TradeMaster
                </h1>
                <p className="text-xs text-gray-500">Professional Trading</p>
              </div>
            </div>
          </div>
          <div className="mt-5 h-0 flex-1 overflow-y-auto px-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      active
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                        : "text-gray-600 hover:bg-white/50 hover:text-gray-900 hover:shadow-md"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                        active
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20">
          <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4">
            <div className="flex flex-shrink-0 items-center px-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    TradeMaster
                  </h1>
                  <p className="text-sm text-gray-500">Professional Trading</p>
                </div>
              </div>
            </div>
            <nav className="mt-8 flex-1 space-y-2 px-4">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      active
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                        : "text-gray-600 hover:bg-white/50 hover:text-gray-900 hover:shadow-md"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                        active
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
          <button
            type="button"
            className="border-r border-gray-200/50 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-6">
            <div className="flex flex-1">
              <div className="flex w-full flex-col md:ml-0">
                <div className="relative flex h-full items-center">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {navigation.find((item) => item.href === location.pathname)
                      ?.name || "Dashboard"}
                  </h2>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center space-x-4 md:ml-6">
              {/* <WebSocketStatus /> */}
              <NotificationCenter />
              <button
                type="button"
                className="rounded-full bg-white/50 p-2 text-gray-400 hover:text-gray-500 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
