import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 VUs
    { duration: '5m', target: 500 },   // Ramp up to 500 VUs
    { duration: '5m', target: 1000 },  // Ramp up to 1000 VUs (full load)
    { duration: '3m', target: 500 },   // Ramp down
    { duration: '1m', target: 0 },     // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';
const NUM_INVESTORS = 10000;
const NUM_PROPERTIES = 100;

// Generate deterministic wallet addresses for reproducibility
function getWalletAddress(id) {
  const padded = String(id).padStart(40, '0');
  return `0x${padded}`;
}

// Generate property ID
function getPropertyId(id) {
  return `prop-${String(id).padStart(5, '0')}`;
}

export function setup() {
  console.log(`Setting up stress test with ${NUM_INVESTORS} investors`);
  return {
    investors: Array.from({ length: NUM_INVESTORS }, (_, i) => ({
      id: i,
      address: getWalletAddress(i),
      email: `investor${i}@osanvault.test`,
    })),
    properties: Array.from({ length: NUM_PROPERTIES }, (_, i) => ({
      id: getPropertyId(i),
      title: `Property ${i}`,
      price: String(10000 + i * 1000),
      risk_score: Math.floor(Math.random() * 100),
    })),
  };
}

export default function (data) {
  const { investors, properties } = data;
  const investorIndex = Math.floor(__VU * Math.random() * 10) % NUM_INVESTORS;
  const investor = investors[investorIndex];
  const property = properties[Math.floor(Math.random() * NUM_PROPERTIES)];

  // Scenario: User registration
  let registerRes = http.post(`${BASE_URL}/api/auth/register`,
    JSON.stringify({
      address: investor.address,
      email: investor.email,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(registerRes, {
    'register: status is 200': (r) => r.status === 200 || r.status === 400, // 400 if exists
    'register: response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5);

  // Scenario: Fetch user portfolio
  let portfolioRes = http.get(`${BASE_URL}/api/users/${investor.address}/portfolio`);

  check(portfolioRes, {
    'portfolio: status is 200': (r) => r.status === 200,
    'portfolio: response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(0.5);

  // Scenario: Browse properties
  let propertiesRes = http.get(`${BASE_URL}/api/properties?page=1&limit=20`);

  check(propertiesRes, {
    'properties: status is 200': (r) => r.status === 200,
    'properties: response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5);

  // Scenario: Get single property details
  let propertyRes = http.get(`${BASE_URL}/api/properties/${property.id}`);

  check(propertyRes, {
    'property: status is 200': (r) => r.status === 200,
    'property: response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(0.5);

  // Scenario: Buy property (20% of users)
  if (Math.random() < 0.2) {
    let buyRes = http.post(`${BASE_URL}/api/investments/buy`,
      JSON.stringify({
        buyer: investor.address,
        propertyId: property.id,
        amount: '1',
        signature: 'mock-signature-' + randomString(32),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(buyRes, {
      'buy: status is 200': (r) => r.status === 200,
      'buy: response time < 1500ms': (r) => r.timings.duration < 1500,
    });

    sleep(1);
  }

  // Scenario: Claim yield (10% of users)
  if (Math.random() < 0.1) {
    let claimRes = http.post(`${BASE_URL}/api/investments/claim-yield`,
      JSON.stringify({
        user: investor.address,
        amount: '100',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(claimRes, {
      'claim: status is 200': (r) => r.status === 200 || r.status === 400,
      'claim: response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    sleep(1);
  }

  sleep(Math.random() * 2);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

function textSummary(data, options = {}) {
  const { indent = '', enableColors = false } = options;
  let summary = '';

  summary += '\n' + '='.repeat(60) + '\n';
  summary += 'STRESS TEST RESULTS\n';
  summary += '='.repeat(60) + '\n';

  if (data.metrics) {
    const metrics = data.metrics;

    summary += '\n📊 HTTP REQUEST METRICS\n';
    summary += '-'.repeat(40) + '\n';

    Object.keys(metrics).forEach(metricName => {
      const metric = metrics[metricName];
      if (metric.type === 'Trend' && metric.values) {
        const values = Object.values(metric.values);
        if (values.length > 0) {
          summary += `${metricName}:\n`;
          summary += `  avg: ${Math.round(metric.values.avg)}ms\n`;
          summary += `  p95: ${Math.round(metric.values['p(95)'])}ms\n`;
          summary += `  p99: ${Math.round(metric.values['p(99)'])}ms\n`;
          summary += `  max: ${Math.round(metric.values.max)}ms\n\n`;
        }
      }
      if (metric.type === 'Rate' && metric.values) {
        summary += `${metricName}: ${(metric.values.rate * 100).toFixed(2)}%\n\n`;
      }
      if (metric.type === 'Counter' && metric.values) {
        summary += `${metricName}: ${metric.values.count}\n\n`;
      }
    });
  }

  summary += '='.repeat(60) + '\n';
  return summary;
}
