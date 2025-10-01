# Futures Trading Bot - Full Stack Application

A complete TypeScript-based futures trading bot with React frontend, built with SOLID principles, featuring real-time price streaming, automated stop-loss management, strategy-based trading, and a modern web dashboard.

## 🏗️ SOLID Architecture

This project follows SOLID principles for maintainable, scalable, and testable code:

### **S** - Single Responsibility Principle

- Each class has one reason to change
- Services handle specific business logic
- Controllers manage HTTP requests
- Clear separation of concerns

### **O** - Open/Closed Principle

- Strategy service is open for extension, closed for modification
- Easy to add new trading strategies without changing existing code

### **L** - Liskov Substitution Principle

- All services implement their interfaces correctly
- Can substitute implementations without breaking functionality

### **I** - Interface Segregation Principle

- Small, focused interfaces
- Clients depend only on methods they use

### **D** - Dependency Inversion Principle

- High-level modules don't depend on low-level modules
- Both depend on abstractions (interfaces)
- Dependency injection throughout the application

## 🚀 Quick Start

### 1. Install Dependencies

**Option A: Using PowerShell (Recommended)**

```powershell
.\install.ps1
```

**Option B: Using Command Prompt**

```cmd
npm install
```

**Option C: Using Batch File**

```cmd
install.bat
```

### 2. Environment Setup

1. Copy `env.example` to `.env`
2. Add your CoinDCX API credentials:
   ```
   COINDCX_API_KEY=your_api_key_here
   COINDCX_API_SECRET=your_api_secret_here
   PORT=3000
   ```

### 3. Run the Application

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm run build
npm run start
```

**Development with Auto-restart:**

```bash
npm run dev:watch
```

**Full Stack Development (Backend + Frontend):**

```bash
npm run dev:full
```

This runs both the backend API and React frontend simultaneously.

## 🎨 React Frontend

The project includes a modern React dashboard built with TypeScript and Tailwind CSS:

### Frontend Features

- 📊 **Dashboard**: Real-time overview of trading activities
- 📈 **Orders**: Create, view, and manage trading orders
- 💰 **Positions**: Monitor current positions and account balance
- 🛡️ **Stop Loss**: Set up and manage stop loss orders
- 🎯 **Strategies**: Configure automated trading strategies
- 💱 **Prices**: Real-time cryptocurrency price monitoring

### Frontend Access

- **Development**: `http://localhost:3001` (React dev server)
- **Production**: `http://localhost:3000/app` (served by Express)

### Frontend Commands

```bash
# Install frontend dependencies
cd frontend && npm install

# Start frontend development server
npm run dev:frontend

# Build frontend for production
npm run build:frontend
```

## 📁 Project Structure

```
src/
├── index.ts                    # Main entry point
├── app.ts                      # Application orchestration
├── interfaces/
│   └── IApiService.ts          # Service interfaces
├── services/
│   ├── ApiService.ts           # API communication
│   ├── WebSocketService.ts     # WebSocket management
│   ├── StopLossService.ts      # Stop-loss management
│   ├── StrategyService.ts      # Trading strategies
│   ├── PriceService.ts         # Price data management
│   └── TradingService.ts       # Trading logic
├── controllers/
│   ├── OrderController.ts      # Order management
│   ├── PositionController.ts   # Position management
│   ├── StopLossController.ts   # Stop-loss endpoints
│   ├── StrategyController.ts   # Strategy endpoints
│   └── PriceController.ts      # Price endpoints
├── routes/
│   └── index.ts                # Route definitions
├── types/
│   └── index.ts                # TypeScript definitions
├── config/
│   └── database.ts             # Configuration
├── utils/
│   └── logger.ts               # Logging utility
└── middleware/
    └── errorHandler.ts         # Error handling
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with ts-node
- `npm run dev:watch` - Start with auto-restart on file changes
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled JavaScript
- `npm run clean` - Clean the dist directory

## 📡 API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:3000/docs` - Interactive API documentation with testing capabilities
- **OpenAPI Spec**: `http://localhost:3000/api-docs` - Raw OpenAPI specification (JSON)

### API Endpoints

#### Orders

- `POST /order` - Create trading order
- `GET /orders` - Get open orders
- `DELETE /orders/:orderId` - Cancel order

#### Positions

- `GET /positions` - Get futures positions
- `GET /balance` - Get account balance
- `GET /account` - Get account info
- `POST /leverage` - Set leverage

#### Stop Loss

- `POST /stoploss` - Set stop loss
- `GET /stoploss/:symbol` - Get stop loss
- `DELETE /stoploss/:symbol` - Remove stop loss
- `GET /levels` - Get all stop losses

#### Strategies

- `POST /stoploss/strategy` - Add strategy stop loss
- `DELETE /stoploss/strategy/:symbol` - Remove strategy
- `GET /strategies` - Get all strategies

#### Prices

- `GET /price/:symbol` - Get latest price
- `GET /prices` - Get all prices

## 🎯 Key Features

### Real-time Trading

- Live price streaming from Binance Futures
- CoinDCX Futures API integration
- Automatic stop-loss execution
- Position management

### Strategy System

- **Last Support**: Advanced candlestick-based support detection
- **Last Close**: Sets stop-loss at previous close price
- **Moving Average**: SMA-based support (20/50 period)
- **Fibonacci**: Fibonacci retracement levels (23.6%, 38.2%, 50%)
- **Pivot Point**: Traditional pivot point support levels

### Risk Management

- Automated stop-loss triggers
- Position size management
- Real-time P&L monitoring

### API Documentation

- **Interactive Swagger UI** with live testing
- **Comprehensive OpenAPI 3.0 specification**
- **Request/Response examples** for all endpoints
- **Authentication documentation** for API keys
- **Schema definitions** for all data models

## 🛠️ TypeScript Configuration

- Strict type checking enabled
- Path mapping (`@/*` aliases)
- Source maps for debugging
- Modern ES2020 target

## 🗄️ Database Configuration

### MongoDB Integration

- **Mongoose ODM** for MongoDB operations
- **Persistent data storage** for all trading operations
- **Automatic data recovery** on application restart
- **Historical data tracking** for analysis

### Database Collections

- `trading_orders` - Order history and status
- `stop_losses` - Stop loss configurations and triggers
- `price_data` - Historical price data
- `trading_strategies` - Strategy configurations and performance
- `positions` - Current and historical positions
- `trade_logs` - Detailed trade execution logs

### Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/trading-bot
COINDCX_API_KEY=your_api_key_here
COINDCX_API_SECRET=your_api_secret_here
COINDCX_BASE_URL=https://api.coindcx.com
COINDCX_FUTURES_URL=https://api.coindcx.com/futures
```

## 🔌 API Integration

### CoinDCX Futures API

- **Order Management**: Create, cancel, and track futures orders
- **Position Tracking**: Monitor open positions and P&L
- **Balance Management**: Track account balance and margin
- **Leverage Control**: Set and manage leverage for positions
- **Advanced Orders**: Support for stop-loss, take-profit, and conditional orders

### API Features

- **HMAC SHA256 Authentication**: Secure API key and signature authentication
- **Comprehensive Order Types**: Market, limit, stop, and conditional orders
- **Real-time Data**: Live price feeds and position updates
- **Risk Management**: Built-in stop-loss and take-profit mechanisms

- Comprehensive type definitions

## 📦 Dependencies

- **express** - Web framework
- **axios** - HTTP client
- **ws** - WebSocket client
- **mongoose** - MongoDB ODM
- **dotenv** - Environment variables
- **swagger-jsdoc** - OpenAPI documentation generation
- **swagger-ui-express** - Interactive API documentation
- **typescript** - TypeScript compiler
- **ts-node** - TypeScript execution
- **nodemon** - Development auto-restart

## 🔐 Environment Variables

See `env.example` for all available configuration options.

## 🧪 Testing

The SOLID architecture makes testing easy:

- Mock interfaces for unit testing
- Dependency injection for test doubles
- Isolated service testing
- Clear separation of concerns

## 🚀 Deployment

1. Build the project: `npm run build`
2. Set production environment variables
3. Start the application: `npm run start`

## 📈 Future Enhancements

- Additional trading strategies
- Risk management rules
- Performance analytics
- Web dashboard
- Database integration
- Advanced order types
