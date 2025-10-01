// Test CoinDCX Futures API integration
const axios = require("axios");
const crypto = require("crypto");

async function testCoinDCXAPI() {
  const baseUrl = "https://api.coindcx.com";
  const apiKey = process.env.COINDCX_API_KEY || "";
  const apiSecret = process.env.COINDCX_API_SECRET || "";

  if (!apiKey || !apiSecret) {
    console.log(
      "❌ Please set COINDCX_API_KEY and COINDCX_API_SECRET in your .env file"
    );
    return;
  }

  try {
    console.log("🧪 Testing CoinDCX Futures API Integration...\n");

    // Test 1: Create Order
    console.log("1. Testing order creation...");
    const timeStamp = Math.floor(Date.now());
    const orderBody = {
      timestamp: timeStamp,
      order: {
        side: "buy",
        pair: "BTCUSDT",
        order_type: "market_order",
        total_quantity: 0.001,
        leverage: 10,
        notification: "no_notification",
        time_in_force: "good_till_cancel",
        hidden: false,
        post_only: false,
        margin_currency_short_name: ["USDT"],
        stop_loss_price: 40000,
        take_profit_price: 50000,
      },
    };

    const orderPayload = Buffer.from(JSON.stringify(orderBody)).toString();
    const orderSignature = crypto
      .createHmac("sha256", apiSecret)
      .update(orderPayload)
      .digest("hex");

    try {
      const orderResponse = await axios.post(
        `${baseUrl}/exchange/v1/derivatives/futures/orders/create`,
        orderBody,
        {
          headers: {
            "X-AUTH-APIKEY": apiKey,
            "X-AUTH-SIGNATURE": orderSignature,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Order creation API call successful");
      console.log("   Response:", orderResponse.data);
    } catch (error) {
      console.log(
        "⚠️ Order creation failed (expected if no funds):",
        error.response?.data?.message || error.message
      );
    }

    // Test 2: Get Active Orders
    console.log("\n2. Testing get active orders...");
    const ordersBody = {
      timestamp: Math.floor(Date.now()),
      pair: "BTCUSDT",
    };

    const ordersPayload = Buffer.from(JSON.stringify(ordersBody)).toString();
    const ordersSignature = crypto
      .createHmac("sha256", apiSecret)
      .update(ordersPayload)
      .digest("hex");

    try {
      const ordersResponse = await axios.post(
        `${baseUrl}/exchange/v1/derivatives/futures/orders/active`,
        ordersBody,
        {
          headers: {
            "X-AUTH-APIKEY": apiKey,
            "X-AUTH-SIGNATURE": ordersSignature,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Get orders API call successful");
      console.log("   Active orders:", ordersResponse.data);
    } catch (error) {
      console.log(
        "❌ Get orders failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test 3: Get Positions
    console.log("\n3. Testing get positions...");
    const positionsBody = {
      timestamp: Math.floor(Date.now()),
      pair: "BTCUSDT",
    };

    const positionsPayload = Buffer.from(
      JSON.stringify(positionsBody)
    ).toString();
    const positionsSignature = crypto
      .createHmac("sha256", apiSecret)
      .update(positionsPayload)
      .digest("hex");

    try {
      const positionsResponse = await axios.post(
        `${baseUrl}/exchange/v1/derivatives/futures/positions`,
        positionsBody,
        {
          headers: {
            "X-AUTH-APIKEY": apiKey,
            "X-AUTH-SIGNATURE": positionsSignature,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Get positions API call successful");
      console.log("   Positions:", positionsResponse.data);
    } catch (error) {
      console.log(
        "❌ Get positions failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test 4: Get Balance
    console.log("\n4. Testing get balance...");
    const balanceBody = {
      timestamp: Math.floor(Date.now()),
    };

    const balancePayload = Buffer.from(JSON.stringify(balanceBody)).toString();
    const balanceSignature = crypto
      .createHmac("sha256", apiSecret)
      .update(balancePayload)
      .digest("hex");

    try {
      const balanceResponse = await axios.post(
        `${baseUrl}/exchange/v1/derivatives/futures/balance`,
        balanceBody,
        {
          headers: {
            "X-AUTH-APIKEY": apiKey,
            "X-AUTH-SIGNATURE": balanceSignature,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Get balance API call successful");
      console.log("   Balance:", balanceResponse.data);
    } catch (error) {
      console.log(
        "❌ Get balance failed:",
        error.response?.data?.message || error.message
      );
    }

    console.log("\n🎉 API integration test completed!");
    console.log("\n📚 API Endpoints tested:");
    console.log("   - POST /exchange/v1/derivatives/futures/orders/create");
    console.log("   - POST /exchange/v1/derivatives/futures/orders/active");
    console.log("   - POST /exchange/v1/derivatives/futures/positions");
    console.log("   - POST /exchange/v1/derivatives/futures/balance");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testCoinDCXAPI();
