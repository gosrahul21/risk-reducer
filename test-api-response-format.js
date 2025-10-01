// Test API response format consistency
const axios = require("axios");

async function testApiResponseFormat() {
  const baseUrl = "http://localhost:3000";

  try {
    console.log("🧪 Testing API Response Format...\n");

    // Test 1: Check if backend is running
    console.log("1. Testing backend API...");
    try {
      const healthResponse = await axios.get(`${baseUrl}/`);
      console.log("✅ Backend API is running");
      console.log(
        "   Health response:",
        JSON.stringify(healthResponse.data, null, 2)
      );
    } catch (error) {
      console.log(
        "❌ Backend API is not running. Please start with: npm run dev"
      );
      return;
    }

    // Test 2: Test orders endpoint response format
    console.log("\n2. Testing orders endpoint response format...");
    try {
      const response = await axios.get(`${baseUrl}/api/orders`);
      console.log(`✅ Orders endpoint accessible: ${response.status}`);
      console.log(
        "   Response structure:",
        JSON.stringify(response.data, null, 2)
      );

      // Check if response has the expected structure
      if (response.data.success !== undefined) {
        console.log("   ✅ Response has 'success' field");
        if (response.data.data !== undefined) {
          console.log("   ✅ Response has 'data' field");
          if (Array.isArray(response.data.data)) {
            console.log(
              `   ✅ Data is an array with ${response.data.data.length} items`
            );
          } else {
            console.log("   ⚠️ Data is not an array");
          }
        } else {
          console.log("   ⚠️ Response missing 'data' field");
        }
        if (response.data.message !== undefined) {
          console.log("   ✅ Response has 'message' field");
        }
      } else {
        console.log(
          "   ⚠️ Response missing 'success' field - may be direct data"
        );
      }
    } catch (error) {
      console.log(
        `   ❌ Orders endpoint error: ${
          error.response?.status || error.message
        }`
      );
    }

    // Test 3: Test positions endpoint
    console.log("\n3. Testing positions endpoint...");
    try {
      const response = await axios.get(`${baseUrl}/api/positions`);
      console.log(`✅ Positions endpoint accessible: ${response.status}`);
      console.log(
        "   Response structure:",
        JSON.stringify(response.data, null, 2)
      );
    } catch (error) {
      console.log(
        `   ❌ Positions endpoint error: ${
          error.response?.status || error.message
        }`
      );
    }

    // Test 4: Test balance endpoint
    console.log("\n4. Testing balance endpoint...");
    try {
      const response = await axios.get(`${baseUrl}/api/balance`);
      console.log(`✅ Balance endpoint accessible: ${response.status}`);
      console.log(
        "   Response structure:",
        JSON.stringify(response.data, null, 2)
      );
    } catch (error) {
      console.log(
        `   ❌ Balance endpoint error: ${
          error.response?.status || error.message
        }`
      );
    }

    console.log("\n🎉 API response format test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testApiResponseFormat();
