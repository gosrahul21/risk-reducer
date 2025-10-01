import { Request, Response } from "express";
import { PriceService } from "../services/PriceService";
import { ResponseHelper } from "../utils/responseHelper";

/**
 * @swagger
 * tags:
 *   name: Prices
 *   description: Price data endpoints
 */

// Price Controller - Single Responsibility: Handle price-related requests
export class PriceController {
  constructor(private priceService: PriceService) {}

  /**
   * @swagger
   * /price/{symbol}:
   *   get:
   *     summary: Get latest price for a trading pair
   *     tags: [Prices]
   *     parameters:
   *       - in: path
   *         name: symbol
   *         required: true
   *         schema:
   *           type: string
   *         description: Trading pair symbol
   *         example: "BTCUSDT"
   *     responses:
   *       200:
   *         description: Current price data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 symbol:
   *                   type: string
   *                 price:
   *                   type: number
   *                   nullable: true
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getPrice(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      const price = this.priceService.getPrice(symbol as string);
      ResponseHelper.sendSuccess(res, {
        symbol,
        price: price || null,
      });
      // res.json({
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.message });
    }
  }

  async getAllPrices(req: Request, res: Response): Promise<void> {
    try {
      const prices = this.priceService.getAllPrices();
      ResponseHelper.sendSuccess(res, { prices });
      // res.json({ prices });
    } catch (err: any) {
      ResponseHelper.sendError(res, err);
      // res.status(400).json({ error: err.message });
    }
  }
}
