import { Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger";

// Swagger UI middleware
export const swaggerUiMiddleware = swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Futures Trading Bot API",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "none",
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    url: "/api-docs", // Explicitly set the URL to the JSON spec
  },
  customCssUrl: undefined, // Disable custom CSS URL to avoid MIME type issues
});

// Serve Swagger JSON
export const swaggerJson = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.send(swaggerSpec);
};

// Swagger UI route handler
export const swaggerUiHandler = swaggerUi.serve;
