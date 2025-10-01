// Test full stack application
const axios = require("axios");

async function testFullStack() {
  const baseUrl = "http://localhost:3000";

  try {
    console.log("🧪 Testing Full Stack Application...\n");

    // Test 1: Check if backend is running
    console.log("1. Testing backend API...");
    try {
      const healthResponse = await axios.get(`${baseUrl}/`);
      console.log("✅ Backend API is running");
      console.log("   Message:", healthResponse.data.message);
      console.log("   Frontend URL:", healthResponse.data.frontend);
    } catch (error) {
      console.log(
        "❌ Backend API is not running. Please start with: npm run dev"
      );
      return;
    }

    // Test 2: Check Swagger documentation
    console.log("\n2. Testing Swagger documentation...");
    try {
      const swaggerResponse = await axios.get(`${baseUrl}/docs`);
      console.log("✅ Swagger UI accessible");
      console.log("   Status:", swaggerResponse.status);
    } catch (error) {
      console.log("❌ Swagger UI not accessible:", error.message);
    }

    // Test 3: Check API endpoints
    console.log("\n3. Testing API endpoints...");
    const endpoints = [
      { name: "Orders", url: "/api/orders" },
      { name: "Positions", url: "/api/positions" },
      { name: "Balance", url: "/api/balance" },
      { name: "Prices", url: "/api/prices" },
      { name: "Stop Losses", url: "/api/levels" },
      { name: "Strategies", url: "/api/strategies" },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${baseUrl}${endpoint.url}`);
        console.log(`   ✅ ${endpoint.name}: ${response.status}`);
      } catch (error) {
        console.log(
          `   ❌ ${endpoint.name}: ${error.response?.status || error.message}`
        );
      }
    }

    // Test 4: Check React app (if built)
    console.log("\n4. Testing React app...");
    try {
      const appResponse = await axios.get(`${baseUrl}/app`);
      if (appResponse.data.includes("root")) {
        console.log("✅ React app is built and accessible");
      } else {
        console.log("⚠️ React app endpoint accessible but may not be built");
      }
    } catch (error) {
      console.log(
        "❌ React app not accessible. Build with: npm run build:frontend"
      );
    }

    console.log("\n🎉 Full stack testing completed!");
    console.log("\n📚 Access your application:");
    console.log("   - Backend API: http://localhost:3000/");
    console.log("   - Swagger Docs: http://localhost:3000/docs");
    console.log("   - React App: http://localhost:3001/");
    console.log("\n🚀 To start development:");
    console.log("   - Backend only: npm run dev");
    console.log("   - Frontend only: npm run dev:frontend");
    console.log("   - Full stack: npm run dev:full");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testFullStack();
