import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { PositionController } from "../controllers/PositionController";
import { StopLossController } from "../controllers/StopLossController";
import { StrategyController } from "../controllers/StrategyController";
import { PriceController } from "../controllers/PriceController";
import { PriceAlertController } from "../controllers/PriceAlertController";
import { TechnicalController } from "../controllers/TechnicalController";
import { IApiService } from "../interfaces/IApiService";
import { IStopLossService } from "../services/StopLossService";
import { IStrategyService } from "../interfaces/IApiService";
import { PriceService } from "../services/PriceService";
import { PriceAlertService } from "../services/PriceAlertService";
import { TechnicalService } from "../services/TechnicalService";
import { WebSocketServer } from "../services/WebSocketServer";
import {
  swaggerUiHandler,
  swaggerUiMiddleware,
  swaggerJson,
} from "../middleware/swagger";

// Route setup - Single Responsibility: Define all routes
export function setupRoutes(
  apiService: IApiService,
  stopLossService: IStopLossService,
  strategyService: IStrategyService,
  priceService: PriceService,
  priceAlertService: PriceAlertService,
  webSocketServer?: WebSocketServer
): Router {
  const router = Router();

  // Initialize controllers
  const orderController = new OrderController(apiService, webSocketServer);
  const positionController = new PositionController(apiService);
  const stopLossController = new StopLossController(
    stopLossService,
    priceService
  );
  const strategyController = new StrategyController(strategyService);
  const priceController = new PriceController(priceService);
  const priceAlertController = new PriceAlertController(priceAlertService);
  const technicalController = new TechnicalController(new TechnicalService(priceService));

  // Order routes
  router.post("/order", (req, res) => orderController.createOrder(req, res));
  router.get("/orders", (req, res) => orderController.getOrders(req, res));
  router.delete("/orders/:orderId", (req, res) =>
    orderController.cancelOrder(req, res)
  );

  // Position routes
  router.get("/positions", (req, res) =>
    positionController.getPositions(req, res)
  );
  router.get("/balance", (req, res) => positionController.getBalance(req, res));
  router.get("/account", (req, res) => positionController.getAccount(req, res));
  router.post("/leverage", (req, res) =>
    positionController.setLeverage(req, res)
  );

  // Stop loss routes
  router.post("/stoploss", (req, res) =>
    stopLossController.setStopLoss(req, res)
  );
  router.get("/stoploss/:symbol", (req, res) =>
    stopLossController.getStopLoss(req, res)
  );
  router.delete("/stoploss/:symbol", (req, res) =>
    stopLossController.removeStopLoss(req, res)
  );
  router.get("/levels", (req, res) =>
    stopLossController.getAllStopLosses(req, res)
  );
  router.get("/stoploss/history", (req, res) =>
    stopLossController.getStopLossHistory(req, res)
  );

  // Strategy routes
  router.post("/stoploss/strategy", (req, res) =>
    strategyController.addStrategyStopLoss(req, res)
  );
  router.delete("/stoploss/strategy/:symbol", (req, res) =>
    strategyController.removeStrategyStopLoss(req, res)
  );
  router.get("/strategies", (req, res) =>
    strategyController.getAllStrategies(req, res)
  );

  // Price routes
  router.get("/price/:symbol", (req, res) =>
    priceController.getPrice(req, res)
  );
  router.get("/prices", (req, res) => priceController.getAllPrices(req, res));

  // Price Alert routes
  router.post("/price-alert",(req:  any, res: any) => priceAlertController.createPriceAlert(req, res));
  router.get("/price-alerts",(req: any, res: any) => priceAlertController.getPriceAlerts(req, res));
  router.delete("/price-alert/:symbol",(req: any, res: any) => priceAlertController.removePriceAlert(req, res));

  // Technical Analysis routes
  router.get("/technical/support-resistance/:symbol/:timeframe", (req: any, res: any) => 
    technicalController.getSupportResistanceLevels(req, res));

  // Swagger documentation routes
  router.get("/api-docs", (req, res, next) => {
    console.log("📚 Swagger JSON endpoint accessed");
    swaggerJson(req, res, next);
  });

  // Serve Swagger UI
  router.use("/docs", swaggerUiHandler, swaggerUiMiddleware);

  // Health check
  router.get("/", (req, res) => {
    res.json({
      message: "Futures Trading Bot API",
      version: "1.0.0",
      status: "running",
      documentation: "/docs",
      apiSpec: "/api-docs",
      frontend: "/app",
      endpoints: {
        "POST /order": "Create order",
        "GET /orders": "Get open orders",
        "DELETE /orders/:orderId": "Cancel order",
        "GET /positions": "Get positions",
        "GET /balance": "Get account balance",
        "GET /account": "Get account info",
        "POST /leverage": "Set leverage",
        "POST /stoploss": "Set stop loss",
        "GET /stoploss/:symbol": "Get stop loss",
        "DELETE /stoploss/:symbol": "Remove stop loss",
        "GET /levels": "Get all stop losses",
        "POST /stoploss/strategy": "Add strategy stop loss",
        "DELETE /stoploss/strategy/:symbol": "Remove strategy stop loss",
        "GET /strategies": "Get all strategies",
        "GET /price/:symbol": "Get latest price",
        "GET /prices": "Get all prices",
        "POST /price-alert": "Create price alert",
        "GET /price-alerts": "Get all price alerts",
        "DELETE /price-alert/:symbol": "Remove price alert",
        "GET /": "API info",
        "GET /docs": "Interactive API documentation",
        "GET /api-docs": "OpenAPI specification",
        "GET /app": "Trading Dashboard (React App)",
      },
    });
  });

  // // Serve React app for all non-API routes
  // router.get("/app", (req, res) => {
  //   res.sendFile("index.html", { root: "frontend/build" });
  // });

  // // Catch-all route for React app (must be last)
  // router.get("*", (req, res) => {
  //   res.sendFile("index.html", { root: "frontend/build" });
  // });

  return router;
}
