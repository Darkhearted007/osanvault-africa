import http from 'http';

// Configuration
const API_URL = 'http://localhost:3001';
const NUM_INVESTORS = 10000;
const NUM_PROPERTIES = 100;
const CONCURRENT_VUS = 1000;
const DURATION_SECONDS = 60; // Quick test
const BATCH_SIZE = 100; // Process 100 VUs at a time

let results = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: Date.now(),
};

function getWalletAddress(id) {
  const padded = String(id).padStart(40, '0');
  return `0x${padded}`;
}

function getPropertyId(id) {
  return `prop-${String(id).padStart(5, '0')}`;
}

async function makeRequest(method, path, body = null) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(path, API_URL);

    const options = {
      hostname: url.hostname,
      port: url.port || 3001,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        results.responseTimes.push(duration);
        results.totalRequests++;

        if (res.statusCode >= 200 && res.statusCode < 300) {
          results.successfulRequests++;
        } else {
          results.failedRequests++;
          if (res.statusCode >= 400) {
            results.errors.push(`${method} ${path}: ${res.statusCode}`);
          }
        }

        resolve({ status: res.statusCode, duration });
      });
    });

    req.on('error', (err) => {
      results.failedRequests++;
      results.errors.push(err.message);
      results.totalRequests++;
      resolve({ status: 0, duration: Date.now() - startTime });
    });

    req.on('timeout', () => {
      req.destroy();
      results.failedRequests++;
      results.totalRequests++;
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function simulateUserFlow(vuId) {
  const investorId = Math.floor(Math.random() * NUM_INVESTORS);
  const propertyId = Math.floor(Math.random() * NUM_PROPERTIES);
  const investor = {
    address: getWalletAddress(investorId),
    email: `investor${investorId}@test.com`,
  };
  const property = getPropertyId(propertyId);

  try {
    // 1. Register
    await makeRequest('POST', '/api/auth/register', investor);

    // 2. Get portfolio
    await makeRequest('GET', `/api/users/${investor.address}/portfolio`);

    // 3. Browse properties
    await makeRequest('GET', '/api/properties?page=1&limit=20');

    // 4. Get property details
    await makeRequest('GET', `/api/properties/${property}`);

    // 5. Buy property (20% of users)
    if (Math.random() < 0.2) {
      await makeRequest('POST', '/api/investments/buy', {
        buyer: investor.address,
        propertyId: property,
        amount: 1,
        signature: 'mock-sig',
      });
    }

    // 6. Claim yield (10% of users)
    if (Math.random() < 0.1) {
      await makeRequest('POST', '/api/investments/claim-yield', {
        user: investor.address,
        amount: 100,
      });
    }
  } catch (err) {
    results.errors.push(err.message);
  }
}

async function runLoadTest() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 OSANVAULT STRESS TEST');
  console.log('='.repeat(70));
  console.log(`📊 Configuration:`);
  console.log(`   • Concurrent VUs: ${CONCURRENT_VUS}`);
  console.log(`   • Duration: ${DURATION_SECONDS}s`);
  console.log(`   • Investors: ${NUM_INVESTORS}`);
  console.log(`   • Properties: ${NUM_PROPERTIES}`);
  console.log(`   • Target API: ${API_URL}`);
  console.log('='.repeat(70));
  console.log('⏳ Starting test...\n');

  const endTime = Date.now() + DURATION_SECONDS * 1000;
  let activeVUs = 0;

  while (Date.now() < endTime) {
    const currentTime = Date.now();
    const elapsed = (currentTime - results.startTime) / 1000;

    // Ramp up VUs progressively
    let targetVUs = CONCURRENT_VUS;
    if (elapsed < 10) {
      targetVUs = Math.floor((elapsed / 10) * CONCURRENT_VUS);
    } else if (elapsed > DURATION_SECONDS - 5) {
      targetVUs = Math.floor(((DURATION_SECONDS - elapsed) / 5) * CONCURRENT_VUS);
    }

    // Adjust active VUs
    while (activeVUs < targetVUs) {
      const vuId = activeVUs++;
      simulateUserFlow(vuId).catch(() => {});
    }

    // Progress indicator
    const progress = Math.min(100, Math.floor((elapsed / DURATION_SECONDS) * 100));
    const bar = '█'.repeat(progress / 2) + '░'.repeat(50 - progress / 2);
    process.stdout.write(`\r[${bar}] ${progress}% | VUs: ${activeVUs} | Requests: ${results.totalRequests}`);

    await new Promise(r => setTimeout(r, 100));
  }

  // Wait for remaining requests
  await new Promise(r => setTimeout(r, 2000));

  const testDuration = (Date.now() - results.startTime) / 1000;

  // Calculate stats
  const responseTimes = results.responseTimes.sort((a, b) => a - b);
  const avgResponse = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0;
  const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0;
  const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0;
  const maxResponse = Math.max(...responseTimes);
  const minResponse = Math.min(...responseTimes);
  const errorRate = (results.failedRequests / results.totalRequests * 100).toFixed(2);
  const successRate = (results.successfulRequests / results.totalRequests * 100).toFixed(2);
  const rps = (results.totalRequests / testDuration).toFixed(2);

  console.log('\n\n' + '='.repeat(70));
  console.log('📈 STRESS TEST RESULTS');
  console.log('='.repeat(70));

  console.log('\n⏱️  TIMING METRICS (ms)');
  console.log(`   • Average:      ${avgResponse.toFixed(2)}ms`);
  console.log(`   • p95:          ${p95}ms`);
  console.log(`   • p99:          ${p99}ms`);
  console.log(`   • Min:          ${minResponse}ms`);
  console.log(`   • Max:          ${maxResponse}ms`);

  console.log('\n📊 REQUEST METRICS');
  console.log(`   • Total:        ${results.totalRequests} requests`);
  console.log(`   • Successful:   ${results.successfulRequests} (${successRate}%)`);
  console.log(`   • Failed:       ${results.failedRequests} (${errorRate}%)`);
  console.log(`   • Throughput:   ${rps} req/s`);
  console.log(`   • Duration:     ${testDuration.toFixed(2)}s`);

  console.log('\n⚠️  ERRORS (Top 5)');
  const errorCounts = {};
  results.errors.forEach(err => {
    errorCounts[err] = (errorCounts[err] || 0) + 1;
  });
  Object.entries(errorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([err, count]) => {
      console.log(`   • ${err}: ${count}x`);
    });

  console.log('\n✅ PERFORMANCE TARGETS');
  console.log(`   • Avg < 500ms:     ${avgResponse < 500 ? '✅' : '❌'} (${avgResponse.toFixed(0)}ms)`);
  console.log(`   • p95 < 1000ms:    ${p95 < 1000 ? '✅' : '❌'} (${p95}ms)`);
  console.log(`   • p99 < 2000ms:    ${p99 < 2000 ? '✅' : '❌'} (${p99}ms)`);
  console.log(`   • Error rate < 1%: ${errorRate < 1 ? '✅' : '❌'} (${errorRate}%)`);
  console.log(`   • Throughput > 50: ${rps > 50 ? '✅' : '❌'} (${rps} req/s)`);

  console.log('\n' + '='.repeat(70));
  console.log('🏁 Test Complete\n');
}

runLoadTest().catch(console.error);
