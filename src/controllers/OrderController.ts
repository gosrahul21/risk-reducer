import { Request, Response } from "express";
import { IApiService } from "../interfaces/IApiService";
import { ResponseHelper } from "../utils/responseHelper";
import { WebSocketServer } from "../services/WebSocketServer";

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

// Order Controller - Single Responsibility: Handle order-related requests
export class OrderController {
  constructor(
    private apiService: IApiService,
    private webSocketServer?: WebSocketServer
  ) {}

  /**
   * @swagger
   * /order:
   *   post:
   *     summary: Create a new trading order
   *     tags: [Orders]
   *     security:
   *       - ApiKeyAuth: []
   *       - SignatureAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Order'
   *           example:
   *             side: "buy"
   *             market: "BTCUSDT"
   *             price: 45000
   *             quantity: 0.001
   *             order_type: "limit_order"
   *             leverage: 10
   *             stop_loss_price: 44000
   *             take_profit_price: 46000
   *     responses:
   *       200:
   *         description: Order created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const {
        side,
        pair,
        price,
        total_quantity,
        order_type,
        margin_currency_short_name,
        stop_loss_price,
        take_profit_price,
        leverage,
        // Legacy support
        market,
        quantity,
      } = req.body;

      const orderData = {
        side,
        pair: pair || market, // Support both new and legacy field names
        price,
        total_quantity: total_quantity || quantity, // Support both new and legacy field names
        order_type,
        margin_currency_short_name,
        stop_loss_price,
        take_profit_price,
        leverage: leverage || 1,
      };

      const result = await this.apiService.createOrder(orderData);

      // Send WebSocket notification
      if (this.webSocketServer && result?.id) {
        this.webSocketServer.sendOrderUpdate(
          result.id,
          result.status || "created",
          `${side.toUpperCase()} order for ${pair} created successfully`
        );
      }

      ResponseHelper.sendSuccess(res, result);
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
    }
  }

  /**
   * @swagger
   * /orders:
   *   get:
   *     summary: Get open orders
   *     tags: [Orders]
   *     security:
   *       - ApiKeyAuth: []
   *       - SignatureAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Filter by order status
   *         example: "open"
   *     responses:
   *       200:
   *         description: List of open orders
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const result = await this.apiService.getOrders(status as string);
      ResponseHelper.sendSuccess(res, result);
    } catch (err: any) {
      console.log("error in orders", err.message);
      ResponseHelper.sendError(res, err);
    }
  }

  /**
   * @swagger
   * /orders/{orderId}:
   *   delete:
   *     summary: Cancel an order
   *     tags: [Orders]
   *     security:
   *       - ApiKeyAuth: []
   *       - SignatureAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: string
   *         description: Order ID to cancel
   *         example: "12345"
   *       - in: query
   *         name: symbol
   *         schema:
   *           type: string
   *         description: Trading pair symbol
   *         example: "BTCUSDT"
   *     responses:
   *       200:
   *         description: Order cancelled successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { symbol } = req.query;
      const result = await this.apiService.cancelOrder(
        orderId as string,
        symbol as string
      );

      // Send WebSocket notification
      if (this.webSocketServer) {
        this.webSocketServer.sendOrderUpdate(
          orderId as string,
          "cancelled",
          `Order ${orderId} cancelled successfully`
        );
      }

      ResponseHelper.sendSuccess(res, result);
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
    }
  }
}
