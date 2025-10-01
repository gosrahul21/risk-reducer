import { Request, Response } from "express";
import { IStrategyService } from "../interfaces/IApiService";
import { ResponseHelper } from "../utils/responseHelper";

/**
 * @swagger
 * tags:
 *   name: Strategies
 *   description: Trading strategy management endpoints
 */

// Strategy Controller - Single Responsibility: Handle strategy requests
export class StrategyController {
  constructor(private strategyService: IStrategyService) {}

  /**
   * @swagger
   * /stoploss/strategy:
   *   post:
   *     summary: Add a strategy-based stop loss
   *     tags: [Strategies]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Strategy'
   *           example:
   *             symbol: "BTCUSDT"
   *             strategy: "last_support"
   *             timeframe: "1h"
   *     responses:
   *       200:
   *         description: Strategy stop loss added successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 strategy:
   *                   type: string
   *                 timeframe:
   *                   type: string
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async addStrategyStopLoss(req: Request, res: Response): Promise<void> {
    try {
      const { symbol, strategy, timeframe } = req.body;
      this.strategyService.addStrategyStopLoss(symbol, strategy, timeframe);
      ResponseHelper.sendSuccess(res, {
        message: `Strategy stop-loss added for ${symbol}`,
        strategy,
        timeframe,
      });
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.message });
    }
  }

  async removeStrategyStopLoss(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      this.strategyService.removeStrategyStopLoss(symbol as string);
      res.json({ message: `Strategy stop-loss removed for ${symbol}` });
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.message });
    }
  }

  async getAllStrategies(req: Request, res: Response): Promise<void> {
    try {
      const strategies = this.strategyService.getAllStrategies();
      console.log("🔍 Strategies:", strategies);
      ResponseHelper.sendSuccess(res, { strategies });
      // res.json({ strategies });
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.message });
    }
  }
}
