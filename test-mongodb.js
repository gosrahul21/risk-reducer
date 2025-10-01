// Test MongoDB integration
const mongoose = require("mongoose");

async function testMongoDBIntegration() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/trading-bot";

  try {
    console.log("🧪 Testing MongoDB Integration...\n");

    // Test connection
    console.log("1. Testing MongoDB connection...");
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected successfully");

    // Test database operations
    console.log("\n2. Testing database operations...");

    // Import models
    const {
      TradingOrder,
      StopLoss,
      PriceData,
      TradingStrategy,
      Position,
      TradeLog,
    } = require("./dist/models/TradingData");

    // Test creating a sample stop loss
    const sampleStopLoss = new StopLoss({
      symbol: "BTCUSDT",
      price: 45000,
      strategy: "test",
      timeframe: "1h",
      isActive: true,
    });

    await sampleStopLoss.save();
    console.log("✅ Stop loss created successfully");

    // Test creating sample price data
    const samplePriceData = new PriceData({
      symbol: "BTCUSDT",
      price: 46000,
      volume: 1000,
      change24h: 2.5,
      source: "test",
    });

    await samplePriceData.save();
    console.log("✅ Price data created successfully");

    // Test creating sample trading strategy
    const sampleStrategy = new TradingStrategy({
      symbol: "BTCUSDT",
      strategy: "last_support",
      timeframe: "1h",
      isActive: true,
      config: { windowSize: 5 },
    });

    await sampleStrategy.save();
    console.log("✅ Trading strategy created successfully");

    // Test queries
    console.log("\n3. Testing database queries...");

    const activeStopLosses = await StopLoss.find({ isActive: true });
    console.log(`✅ Found ${activeStopLosses.length} active stop losses`);

    const latestPrices = await PriceData.find()
      .sort({ timestamp: -1 })
      .limit(5);
    console.log(`✅ Found ${latestPrices.length} latest price records`);

    const activeStrategies = await TradingStrategy.find({ isActive: true });
    console.log(`✅ Found ${activeStrategies.length} active strategies`);

    // Cleanup test data
    console.log("\n4. Cleaning up test data...");
    await StopLoss.deleteMany({ strategy: "test" });
    await PriceData.deleteMany({ source: "test" });
    await TradingStrategy.deleteMany({ strategy: "last_support" });
    console.log("✅ Test data cleaned up");

    console.log("\n🎉 All MongoDB tests passed!");
    console.log("\n📊 Database collections available:");
    console.log("   - trading_orders");
    console.log("   - stop_losses");
    console.log("   - price_data");
    console.log("   - trading_strategies");
    console.log("   - positions");
    console.log("   - trade_logs");
  } catch (error) {
    console.error("❌ MongoDB test failed:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure MongoDB is running:");
      console.log(
        "   - Install MongoDB: https://docs.mongodb.com/manual/installation/"
      );
      console.log("   - Start MongoDB: mongod");
      console.log("   - Or use MongoDB Atlas: https://cloud.mongodb.com/");
    }
  } finally {
    await mongoose.disconnect();
    console.log("\n📊 MongoDB connection closed");
  }
}

testMongoDBIntegration();
