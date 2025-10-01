import { Response } from "express";

export class ResponseHelper {
  static setNoCacheHeaders(res: Response): void {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Last-Modified": new Date().toUTCString(),
      ETag: `"${Date.now()}"`,
    });
  }

  static sendSuccess(res: Response, data: any, statusCode: number = 200): void {
    this.setNoCacheHeaders(res);
    res.status(statusCode).json({
      success: true,
      data: data,
      message: "Success",
    });
  }

  static sendError(res: Response, error: any, statusCode: number = 400): void {
    this.setNoCacheHeaders(res);
    res.status(statusCode).json({
      success: false,
      error: error.response?.data || error.message || "Unknown error",
      message: "Error occurred",
    });
  }
}
