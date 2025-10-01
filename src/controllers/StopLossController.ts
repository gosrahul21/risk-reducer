import { Request, Response } from "express";
import { IStopLossService } from "../services/StopLossService";
import { PriceService } from "../services/PriceService";
import { ResponseHelper } from "../utils/responseHelper";

/**
 * @swagger
 * tags:
 *   name: Stop Loss
 *   description: Stop loss management endpoints
 */

// Stop Loss Controller - Single Responsibility: Handle stop loss requests
export class StopLossController {
  constructor(
    private stopLossService: IStopLossService,
    private priceService: PriceService
  ) {}

  /**
   * @swagger
   * /stoploss:
   *   post:
   *     summary: Set stop loss for a trading pair
   *     tags: [Stop Loss]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/StopLoss'
   *           example:
   *             symbol: "BTCUSDT"
   *             price: 45000
   *     responses:
   *       200:
   *         description: Stop loss set successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 symbol:
   *                   type: string
   *                 stopLossPrice:
   *                   type: number
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async setStopLoss(req: Request, res: Response): Promise<void> {
    try {
      const { symbol, price, strategy, timeframe } = req.body;
      await this.stopLossService.setStopLoss(
        symbol,
        price,
        strategy,
        timeframe
      );
      ResponseHelper.sendSuccess(res, {
        message: `Stop loss set for ${symbol} at ${price}`,
        symbol,
        stopLossPrice: price,
        strategy: strategy || "manual",
        timeframe,
      });
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.message });
    }
  }

  async getStopLoss(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      const stopLoss = this.stopLossService.getStopLoss(symbol as string);
      ResponseHelper.sendSuccess(res, {
        symbol,
        stopLoss: stopLoss || null,
      });
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.message });
    }
  }

  async removeStopLoss(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      await this.stopLossService.removeStopLoss(symbol as string);
      ResponseHelper.sendSuccess(res, { message: `Stop loss removed for ${symbol}` });
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.message });
    }
  }

  async getAllStopLosses(req: Request, res: Response): Promise<void> {
    try {
      const stopLosses = this.stopLossService.getAllStopLosses();
      const currentPrices = this.priceService.getAllPrices();
      ResponseHelper.sendSuccess(res, {
        stopLosses,
        currentPrices,
      });
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.message });
    }
  }

  async getStopLossHistory(req: Request, res: Response): Promise<void> {
    try {
      const { symbol, limit } = req.query;
      const history = await this.stopLossService.getStopLossHistory(
        symbol as string,
        limit ? parseInt(limit as string) : 100
      );
      ResponseHelper.sendSuccess(res, { history });
      // res.json({ history });
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.message });
    }
  }
}
