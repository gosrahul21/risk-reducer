import { ResponseHelper } from "../utils/responseHelper";
import { TechnicalService } from "../services/TechnicalService";

export class TechnicalController {
  constructor(private readonly technicalService: TechnicalService) {}

  /**
   * Get the last support and resistance levels for a given symbol and timeframe
   * @param req - The request object
   * @param res - The response object
   * @returns The last support and resistance levels for a given symbol and timeframe
   */
  async getSupportResistanceLevels(req: Request & { params: { symbol: string, timeframe: string } }, res: Response): Promise<void> {
    try {
      const { symbol, timeframe } = req.params;
      const data = await this.technicalService.getLastSupportResistanceLevels(symbol, timeframe);
      ResponseHelper.sendSuccess(res as any, data);
    } catch (err: any) {
      ResponseHelper.sendError(res as any, err);
    }
  }
}