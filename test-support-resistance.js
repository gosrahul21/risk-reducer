const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testSupportResistanceAPI() {
  try {
    console.log('🧪 Testing Support/Resistance API...\n');
    
    // Test different symbols and timeframes
    const testCases = [
      { symbol: 'BTCUSDT', timeframe: '1h' },
      { symbol: 'BTCUSDT', timeframe: '4h' },
      { symbol: 'BTCUSDT', timeframe: '1d' },
      { symbol: 'ETHUSDT', timeframe: '4h' },
      { symbol: 'SOLUSDT', timeframe: '1h' }
    ];
    
    for (const testCase of testCases) {
      console.log(`📊 Testing ${testCase.symbol} - ${testCase.timeframe}`);
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/technical/support-resistance/${testCase.symbol}/${testCase.timeframe}`
        );
        
        const data = response.data.data || response.data;
        
        console.log(`✅ Success!`);
        console.log(`   Supports: ${data.supports?.length || 0} levels`);
        console.log(`   Resistances: ${data.resistances?.length || 0} levels`);
        
        if (data.supports && data.supports.length > 0) {
          console.log(`   Sample Support: ${data.supports[0]}`);
        }
        if (data.resistances && data.resistances.length > 0) {
          console.log(`   Sample Resistance: ${data.resistances[0]}`);
        }
        
      } catch (error) {
        console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('🎉 Support/Resistance API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSupportResistanceAPI();
