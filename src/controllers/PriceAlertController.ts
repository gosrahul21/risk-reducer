import { PriceAlertService, PriceAlertType } from "../services/PriceAlertService";
import { ResponseHelper } from "../utils/responseHelper";

export class PriceAlertController {
  private priceAlertService: PriceAlertService;
  constructor( priceAlertService: PriceAlertService) {
    this.priceAlertService = priceAlertService;
  }

  async createPriceAlert(req: Request, res: Response): Promise<void> {
    try {
      const { symbol, price, type, count } = req.body as any;
      await this.priceAlertService.createPriceAlert(symbol, price, type, count);
      ResponseHelper.sendSuccess(res as any, {
        message: `Price alert created for ${symbol} at ${price}`,
      });
    } catch (err: any) {
      ResponseHelper.sendError(res as any, err);
    }
  }

  async removePriceAlert(req: Request & { params: { symbol: string } }, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      await this.priceAlertService.removePriceAlert(symbol as string);
      ResponseHelper.sendSuccess(res as any, {
        message: `Price alert removed for ${symbol}`
      });
    } catch (err: any) {
      ResponseHelper.sendError(res as any, err);
    }
  }

  async getPriceAlerts(req: Request, res: Response): Promise<void> {
    try {
      const priceAlerts = await this.priceAlertService.getPriceAlerts();
      ResponseHelper.sendSuccess(res as any, { priceAlerts });
    } catch (err: any) {
      ResponseHelper.sendError(res as any, err);
    }
  }
}