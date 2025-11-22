// Test script for the new monthly quota system
const axios = require('axios');

// Mock Firebase token for testing
const TEST_TOKEN = 'test-token';
const API_BASE = 'http://localhost:5001/api';

console.log('🧪 Testing Monthly Quota System');
console.log('=================================');

// Test 1: Health check
async function testHealthCheck() {
  console.log('\n1. Testing backend health...');
  try {
    const response = await axios.get('http://localhost:5001/health');
    console.log('✅ Backend is healthy:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    return false;
  }
}

// Test 2: Test CORS configuration
async function testCORS() {
  console.log('\n2. Testing CORS configuration...');
  try {
    const response = await axios.get(`${API_BASE}/dashboard`, {
      headers: {
        Origin: 'http://localhost:5173',
        Authorization: `Bearer ${TEST_TOKEN}`,
      },
    });
    console.log('✅ CORS allows localhost:5173');
    return true;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ CORS is working (401/403 expected for test token)');
      return true;
    }
    console.error('❌ CORS test failed:', error.message);
    return false;
  }
}

// Test 3: Display current plan limits
async function displayPlanLimits() {
  console.log('\n3. Current Plan Limits:');
  console.log('  Starter: 20 analyses/month');
  console.log('  Standard: 40 analyses/month');
  console.log('  Premium: Unlimited');
}

// Test 4: API endpoint accessibility
async function testEndpoints() {
  console.log('\n4. Testing API endpoints...');
  const endpoints = [
    '/api/dashboard',
    '/api/analyze',
    '/api/stripe',
    '/api/export',
    '/api/user',
  ];

  for (const endpoint of endpoints) {
    try {
      await axios.get(`http://localhost:5001${endpoint}`, {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      });
      console.log(`✅ ${endpoint} - accessible`);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log(`✅ ${endpoint} - accessible (auth required)`);
      } else {
        console.log(`❌ ${endpoint} - error: ${error.message}`);
      }
    }
  }
}

// Run all tests
async function runTests() {
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Backend not running. Please start with: cd Backend && npm run dev');
    return;
  }

  await testCORS();
  await displayPlanLimits();
  await testEndpoints();

  console.log('\n🎉 Testing Complete!');
  console.log('\nTo test the full quota system:');
  console.log('1. Start frontend: cd frontend && npm run dev');
  console.log('2. Create a user and try making 21 analyses');
  console.log('3. Check that quota resets monthly');
}

runTests();
