// E2E Security and Architecture Verification Suite for ProductScout
import http from 'http';

const BASE_URL = 'http://localhost:3002';

async function request(path, options = {}) {
  const url = new URL(path, BASE_URL);
  const method = options.method || 'GET';
  const headers = options.headers || {};
  let body = options.body;

  if (body && typeof body === 'object') {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body,
  });

  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    data,
  };
}

async function runTests() {
  console.log('========================================================');
  console.log('PRODUCTSCOUT PRODUCTION SECURITY & ARCHITECTURE E2E TEST');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message} - ${details}`);
      failed++;
    }
  }

  try {
    // Test 1: Health Check Endpoint
    const health = await request('/api/health');
    assert(health.status === 200, 'GET /api/health returns 200 OK', `Got ${health.status}`);
    assert(health.data.status === 'online', 'Health status is online', JSON.stringify(health.data));
    assert(health.data.app === 'ProductScout (Next.js)', 'App identifier matches ProductScout');

    // Test 2: Security Headers
    const rootPage = await request('/');
    assert(rootPage.headers['x-frame-options'] === 'DENY', 'X-Frame-Options is DENY');
    assert(rootPage.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options is nosniff');
    assert(rootPage.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy is strict-origin-when-cross-origin');
    assert(!rootPage.headers['x-powered-by'], 'X-Powered-By header is disabled');

    // Test 3: Unauthenticated Access to Runs
    const runsRes = await request('/api/research/runs');
    assert(runsRes.status === 200, 'GET /api/research/runs returns 200 for public visitors');
    assert(Array.isArray(runsRes.data), 'GET /api/research/runs returns an array');
    const referenceRun = runsRes.data.find(r => r.id === 'run_sample_ai_automation_smb');
    assert(Boolean(referenceRun), 'Reference benchmark run (run_sample_ai_automation_smb) is accessible to public');
    if (referenceRun) {
      assert(referenceRun.is_reference === true, 'Reference benchmark run has is_reference = true');
    }

    // Test 4: Access Reference Run Details
    const runDetails = await request('/api/research/runs/run_sample_ai_automation_smb');
    assert(runDetails.status === 200, 'GET /api/research/runs/:id returns 200 for reference run');
    assert(runDetails.data.id === 'run_sample_ai_automation_smb', 'Correct run details returned');
    assert(Array.isArray(runDetails.data.opportunities), 'Opportunities array populated from database');
    assert(runDetails.data.opportunities.length > 0, `Opportunities count > 0 (found ${runDetails.data.opportunities?.length})`);

    // Test 5: Mutating Action Rejected for Unauthenticated Users (POST /api/research/run)
    const runCreateRes = await request('/api/research/run', {
      method: 'POST',
      body: { topic: 'Testing multi-tenant isolation guard' },
    });
    assert(runCreateRes.status === 401, 'POST /api/research/run returns 401 Unauthorized for anonymous user', `Got ${runCreateRes.status}`);

    // Test 6: Delete Reference Run Rejected for Unauthenticated Users
    const runDeleteRes = await request('/api/research/runs/run_sample_ai_automation_smb', {
      method: 'DELETE',
    });
    assert(runDeleteRes.status === 401, 'DELETE /api/research/runs/:id returns 401 Unauthorized for anonymous user', `Got ${runDeleteRes.status}`);

    // Test 7: Bookmark Action Rejected for Unauthenticated Users
    const bookmarkRes = await request('/api/opportunities/opp_lead_enrich_error_recovery/bookmark', {
      method: 'POST',
      body: { runId: 'run_sample_ai_automation_smb' },
    });
    assert(bookmarkRes.status === 401, 'POST /api/opportunities/:id/bookmark returns 401 Unauthorized for anonymous user', `Got ${bookmarkRes.status}`);

    // Test 8: Notes Action Rejected for Unauthenticated Users
    const notesRes = await request('/api/opportunities/opp_lead_enrich_error_recovery/notes', {
      method: 'POST',
      body: { notes: 'Attempted unauthorized note insertion' },
    });
    assert(notesRes.status === 401, 'POST /api/opportunities/:id/notes returns 401 Unauthorized for anonymous user', `Got ${notesRes.status}`);

    // Test 9: Settings Update Rejected for Unauthenticated Users
    const settingsUpdateRes = await request('/api/settings', {
      method: 'POST',
      body: { defaultMaxSources: 10 },
    });
    assert(settingsUpdateRes.status === 401, 'POST /api/settings returns 401 Unauthorized for anonymous user', `Got ${settingsUpdateRes.status}`);

    // Test 10: Anonymous Saved Opportunities returns Empty Vault
    const savedRes = await request('/api/opportunities/saved');
    assert(savedRes.status === 200, 'GET /api/opportunities/saved returns 200 for anonymous visitor');
    assert(Array.isArray(savedRes.data) && savedRes.data.length === 0, 'Anonymous visitor receives empty bookmark array (isolation verified)');

    // Test 11: Settings Read does not leak API keys
    const settingsGetRes = await request('/api/settings');
    assert(settingsGetRes.status === 200, 'GET /api/settings returns 200');
    assert(typeof settingsGetRes.data.hasServerGeminiKey === 'boolean', 'Settings reveals hasServerGeminiKey flag without exposing secret key');
    assert(typeof settingsGetRes.data.hasServerOpenaiKey === 'boolean', 'Settings reveals hasServerOpenaiKey flag without exposing secret key');
    assert(!settingsGetRes.data.geminiApiKey, 'Raw GEMINI_API_KEY is NOT present in response');
    assert(!settingsGetRes.data.openaiApiKey, 'Raw OPENAI_API_KEY is NOT present in response');

    console.log('\n========================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
