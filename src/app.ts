import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { setupRoutes } from "./routes";
import { ApiService } from "./services/ApiService";
import { WebSocketService } from "./services/WebSocketService";
import { WebSocketServer } from "./services/WebSocketServer";
import { StopLossService } from "./services/StopLossService";
import { StrategyService } from "./services/StrategyService";
import { PriceService } from "./services/PriceService";
import { TradingService } from "./services/TradingService";
import { database } from "./config/database";
import cors from "cors";
import { PriceAlertService } from "./services/PriceAlertService";
import { TechnicalService } from "./services/TechnicalService";
// Load environment variables
dotenv.config();

// Application class - Single Responsibility: Orchestrate the application
export class App {
  private app: express.Application;
  private server: any;
  private apiService!: ApiService;
  private webSocketService!: WebSocketService;
  private webSocketServer!: WebSocketServer;
  private stopLossService!: StopLossService;
  private strategyService!: StrategyService;
  private priceService!: PriceService;
  private tradingService!: TradingService;
  private priceAlertService!: PriceAlertService;
  private technicalService!: TechnicalService;

  constructor() {
    this.app = express();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.initializeDatabase();
    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await database.connect();
      console.log("✅ Database initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);
      process.exit(1);
    }
  }

  private initializeServices(): void {
    // Initialize services (Dependency Injection)
    this.apiService = new ApiService();
    this.stopLossService = new StopLossService();
    this.priceService = new PriceService();
    this.priceAlertService = new PriceAlertService();

    this.webSocketService = new WebSocketService();
    this.technicalService = new TechnicalService(this.priceService);
    this.strategyService = new StrategyService(this.stopLossService, this.priceService, this.technicalService);

    this.tradingService = new TradingService(
      this.apiService,
      this.stopLossService,
      this.priceService,
      this.strategyService
    );
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: true }));

    // Serve static files from React build
    // this.app.use(express.static("frontend/build"));
  }

  private setupRoutes(): void {
    const router = setupRoutes(
      this.apiService,
      this.stopLossService,
      this.strategyService,
      this.priceService,
      this.priceAlertService,
      this.webSocketServer
    );
    this.app.use("/", router);
  }

  private setupWebSocket(): void {
    // Initialize WebSocket server
    this.webSocketServer = new WebSocketServer(this.server);

    // Set WebSocketServer for StrategyService
    this.strategyService.setWebSocketServer(this.webSocketServer);

    // Set WebSocketServer for StopLossService
    this.stopLossService.setWebSocketServer(this.webSocketServer);

    // Set WebSocketServer for PriceAlertService
    this.priceAlertService.setWebSocketServer(this.webSocketServer);



    // Set up price update handling
    this.webSocketService.onPriceUpdate((symbol: string, price: number) => {
      this.tradingService.handleStopLossTrigger(symbol, price);

      // Check price alerts
      this.priceAlertService.checkPriceAlerts(symbol, price);
      this.priceService.updatePrice(symbol, price);

      // Broadcast price update to frontend clients
      this.webSocketServer.broadcastPriceUpdate(symbol, price);

      // console.log("🔔 Price updated for", symbol, price);
    });

    this.webSocketService.onError((error: Error) => {
      console.error("WebSocket error:", error.message);
      this.webSocketServer.sendSystemNotification(
        "WebSocket Error",
        error.message
      );
    });

    // Start WebSocket connections
    const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "SUIUSDT", "PAXGUSDDT"];
    this.webSocketService.connect(symbols);

    // Start strategy updates
    this.strategyService.startPeriodicUpdates();

    // Send system notification when server starts
    setTimeout(() => {
      this.webSocketServer.sendSystemNotification(
        "Trading Server Started",
        "Real-time price updates and notifications are now active"
      );
    }, 2000);
  }

  public start(port: number = 3000): void {
    this.server = createServer(this.app);
    this.server.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log(`🔌 WebSocket server running at ws://localhost:${port}/ws`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}
