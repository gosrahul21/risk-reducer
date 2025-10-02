import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Force TypeScript refresh
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Positions from "./pages/Positions";
import StopLoss from "./pages/StopLoss";
import Strategies from "./pages/Strategies";
import Prices from "./pages/Prices";
import PriceAlerts from "./pages/PriceAlerts";
import { WebSocketProvider } from "./contexts/WebSocketContext";

function App() {
  return (
    <ErrorBoundary>
      <WebSocketProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/positions" element={<Positions />} />
                <Route path="/stoploss" element={<StopLoss />} />
                <Route path="/strategies" element={<Strategies />} />
                <Route path="/prices" element={<Prices />} />
                <Route path="/price-alerts" element={<PriceAlerts />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </WebSocketProvider>
    </ErrorBoundary>
  );
}

export default App;
