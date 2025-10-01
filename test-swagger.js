// Simple test to verify Swagger integration
const axios = require("axios");

async function testSwaggerIntegration() {
  const baseUrl = "http://localhost:3000";

  try {
    console.log("🧪 Testing Swagger Integration...\n");

    // Test API health
    console.log("1. Testing API health...");
    const healthResponse = await axios.get(`${baseUrl}/`);
    console.log("✅ API is running:", healthResponse.data.message);

    // Test Swagger JSON endpoint
    console.log("\n2. Testing Swagger JSON endpoint...");
    const swaggerResponse = await axios.get(`${baseUrl}/api-docs`);
    console.log("✅ Swagger JSON loaded successfully");
    console.log("   - API Title:", swaggerResponse.data.info.title);
    console.log("   - API Version:", swaggerResponse.data.info.version);
    console.log(
      "   - Endpoints found:",
      Object.keys(swaggerResponse.data.paths).length
    );

    // Test Swagger UI endpoint
    console.log("\n3. Testing Swagger UI endpoint...");
    const swaggerUIResponse = await axios.get(`${baseUrl}/docs`);
    console.log("✅ Swagger UI is accessible");

    console.log(
      "\n🎉 All tests passed! Swagger integration is working correctly."
    );
    console.log("\n📚 Access your API documentation at:");
    console.log("   - Swagger UI: http://localhost:3000/docs");
    console.log("   - OpenAPI Spec: http://localhost:3000/api-docs");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure the server is running: npm run dev");
    }
  }
}

testSwaggerIntegration();
