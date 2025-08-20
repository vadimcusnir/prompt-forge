import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    errors: ['rate<0.1'],              // Custom error rate must be below 10%
  },
};

// Test scenarios
export default function () {
  const baseUrl = __ENV.BASE_URL || 'https://your-app.com';
  
  // Health check endpoint
  const healthCheck = http.get(`${baseUrl}/api/health`);
  check(healthCheck, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  // Main page load
  const mainPage = http.get(`${baseUrl}/`);
  check(mainPage, {
    'main page status is 200': (r) => r.status === 200,
    'main page response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  // API endpoint test
  const apiTest = http.get(`${baseUrl}/api/test`);
  check(apiTest, {
    'api test status is 200': (r) => r.status === 200,
    'api test response time < 800ms': (r) => r.timings.duration < 800,
  });
  
  // Simulate user interaction
  if (Math.random() > 0.7) {
    const postData = JSON.stringify({
      action: 'test',
      timestamp: Date.now(),
    });
    
    const postResponse = http.post(`${baseUrl}/api/action`, postData, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    check(postResponse, {
      'post request status is 200': (r) => r.status === 200,
      'post request response time < 1200ms': (r) => r.timings.duration < 1200,
    });
  }
  
  // Error tracking
  errorRate.add(healthCheck.status !== 200 || mainPage.status !== 200 || apiTest.status !== 200);
  
  // Think time between requests
  sleep(1);
}

// Setup function (runs once before the test)
export function setup() {
  console.log('🚀 Starting k6 load test...');
  console.log(`📍 Target URL: ${__ENV.BASE_URL || 'https://your-app.com'}`);
  console.log('⏱️  Test duration: 9 minutes');
  console.log('👥 Max concurrent users: 10');
}

// Teardown function (runs once after the test)
export function teardown(data) {
  console.log('✅ k6 load test completed');
  console.log('📊 Check the results for performance metrics');
}
