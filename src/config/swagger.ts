import swaggerJsdoc from "swagger-jsdoc";
import { SwaggerDefinition } from "swagger-jsdoc";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Futures Trading Bot API",
    version: "1.0.0",
    description:
      "A comprehensive API for futures trading with automated stop-loss management and strategy-based trading",
    contact: {
      name: "Trading Bot Support",
      email: "support@tradingbot.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://api.tradingbot.com",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-AUTH-APIKEY",
        description: "CoinDCX API Key for authentication",
      },
      SignatureAuth: {
        type: "apiKey",
        in: "header",
        name: "X-AUTH-SIGNATURE",
        description: "HMAC SHA256 signature for request authentication",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Indicates if the request was successful",
          },
          data: {
            type: "object",
            description: "Response data",
          },
          message: {
            type: "string",
            description: "Response message",
          },
          error: {
            type: "string",
            description: "Error message (only in development)",
          },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Order ID",
          },
          client_order_id: {
            type: "string",
            nullable: true,
            description: "Client order ID",
          },
          pair: {
            type: "string",
            example: "B-BTC_USDT",
            description: "Trading pair symbol",
          },
          side: {
            type: "string",
            enum: ["buy", "sell"],
            description: "Order side",
          },
          status: {
            type: "string",
            description: "Order status",
          },
          order_type: {
            type: "string",
            enum: ["limit_order", "market_order"],
            description: "Order type",
          },
          price: {
            type: "number",
            description: "Order price (for limit orders)",
          },
          total_quantity: {
            type: "number",
            description: "Total order quantity",
          },
          remaining_quantity: {
            type: "number",
            description: "Remaining quantity to be filled",
          },
          cancelled_quantity: {
            type: "number",
            description: "Cancelled quantity",
          },
          stop_price: {
            type: "number",
            description: "Stop price for stop orders",
          },
          leverage: {
            type: "number",
            minimum: 1,
            maximum: 125,
            description: "Leverage multiplier",
          },
          maker_fee: {
            type: "number",
            description: "Maker fee percentage",
          },
          taker_fee: {
            type: "number",
            description: "Taker fee percentage",
          },
          margin_currency_short_name: {
            type: "string",
            enum: ["USDT", "INR"],
            description: "Margin currency",
          },
          stop_loss_price: {
            type: "number",
            nullable: true,
            description: "Stop loss price",
          },
          created_at: {
            type: "number",
            description: "Order creation timestamp",
          },
          updated_at: {
            type: "number",
            description: "Order last update timestamp",
          },
          // Legacy fields
          market: {
            type: "string",
            example: "BTCUSDT",
            description: "Trading pair symbol (legacy)",
          },
          quantity: {
            type: "number",
            description: "Order quantity (legacy)",
          },
          notification: {
            type: "string",
            enum: [
              "no_notification",
              "email_notification",
              "push_notification",
            ],
            description: "Notification preference",
          },
          time_in_force: {
            type: "string",
            enum: ["good_till_cancel", "fill_or_kill", "immediate_or_cancel"],
            description: "Time in force",
          },
          hidden: {
            type: "boolean",
            description: "Whether order is hidden",
          },
          post_only: {
            type: "boolean",
            description: "Whether order is post-only",
          },
          take_profit_price: {
            type: "number",
            description: "Take profit price",
          },
        },
        required: ["side", "market", "quantity", "order_type"],
      },
      StopLoss: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            example: "BTCUSDT",
            description: "Trading pair symbol",
          },
          price: {
            type: "number",
            description: "Stop loss price level",
          },
        },
        required: ["symbol", "price"],
      },
      Strategy: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            example: "BTCUSDT",
            description: "Trading pair symbol",
          },
          strategy: {
            type: "string",
            enum: [
              "last_support",
              "last_close",
              "moving_average",
              "fibonacci",
              "pivot_point",
            ],
            description: "Strategy type",
          },
          timeframe: {
            type: "string",
            enum: ["1m", "5m", "15m", "1h", "4h", "1d"],
            description: "Timeframe for strategy calculation",
          },
        },
        required: ["symbol", "strategy", "timeframe"],
      },
      Leverage: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            example: "BTCUSDT",
            description: "Trading pair symbol",
          },
          leverage: {
            type: "number",
            minimum: 1,
            maximum: 125,
            description: "Leverage multiplier",
          },
        },
        required: ["symbol", "leverage"],
      },
      PriceData: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            example: "BTCUSDT",
            description: "Trading pair symbol",
          },
          price: {
            type: "number",
            description: "Current price",
          },
          fundingRate: {
            type: "number",
            description: "Current funding rate (for futures)",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Error message",
          },
        },
      },
    },
  },
  security: [
    {
      ApiKeyAuth: [],
      SignatureAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options);
