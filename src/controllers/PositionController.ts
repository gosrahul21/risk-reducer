import { Request, Response } from "express";
import { IApiService } from "../interfaces/IApiService";
import { ResponseHelper } from "../utils/responseHelper";

/**
 * @swagger
 * tags:
 *   name: Positions
 *   description: Position and account management endpoints
 */

// Position Controller - Single Responsibility: Handle position-related requests
export class PositionController {
  constructor(private apiService: IApiService) {}

  /**
   * @swagger
   * /positions:
   *   get:
   *     summary: Get futures positions
   *     tags: [Positions]
   *     security:
   *       - ApiKeyAuth: []
   *       - SignatureAuth: []
   *     parameters:
   *       - in: query
   *         name: symbol
   *         schema:
   *           type: string
   *         description: Filter by trading pair symbol
   *         example: "BTCUSDT"
   *     responses:
   *       200:
   *         description: List of positions
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
  async getPositions(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.query;
      const result = await this.apiService.getPositions(symbol as string);
      ResponseHelper.sendSuccess(res, result);
      // res.json(result);
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.response?.data || err.message });
    }
  }

  /**
   * @swagger
   * /balance:
   *   get:
   *     summary: Get account balance
   *     tags: [Positions]
   *     security:
   *       - ApiKeyAuth: []
   *       - SignatureAuth: []
   *     responses:
   *       200:
   *         description: Account balance information
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
  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.apiService.getBalance();
      ResponseHelper.sendSuccess(res, result);
      // res.json(result);
    } catch (err: any) {
      console.log(err.response?.data);
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.response?.data || err.message });
    }
  }

  /**
   * @swagger
   * /account:
   *   get:
   *     summary: Get account information
   *     tags: [Positions]
   *     security:
   *       - ApiKeyAuth: []
   *       - SignatureAuth: []
   *     responses:
   *       200:
   *         description: Account information
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
  async getAccount(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.apiService.getAccount();
      ResponseHelper.sendSuccess(res, result);
      // res.json(result);
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.response?.data || err.message });
    }
  }

  /**
   * @swagger
   * /leverage:
   *   post:
   *     summary: Set leverage for a trading pair
   *     tags: [Positions]
   *     security:
   *       - ApiKeyAuth: []
   *       - SignatureAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Leverage'
   *           example:
   *             symbol: "BTCUSDT"
   *             leverage: 10
   *     responses:
   *       200:
   *         description: Leverage set successfully
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
  async setLeverage(req: Request, res: Response): Promise<void> {
    try {
      const { symbol, leverage } = req.body;
      const result = await this.apiService.setLeverage(symbol, leverage);
      ResponseHelper.sendSuccess(res, result);
      // res.json(result);
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.response?.data || err.message });
    }
  }
}
