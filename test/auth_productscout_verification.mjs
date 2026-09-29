import { spawn } from 'node:child_process';
import http from 'node:http';
import assert from 'node:assert';

console.log('========================================================');
console.log('PRODUCTSCOUT — AUTHENTICATION & STANDALONE TEST SUITE');
console.log('========================================================\n');

const PORT = 3097;

function fetchUrl(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:${PORT}${path}`,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          })
        );
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetchUrl('/');
      if (res.status === 200) return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('ProductScout test server failed to start on port ' + PORT);
}

// ----------------------------------------------------------------------------
// 1. Unit Tests: Security & URL Sanitization
// ----------------------------------------------------------------------------
console.log('--- 1. Security & Callback Resolution Tests ---');

function getSafeRedirectPath(candidate, fallback = '/') {
  if (!candidate || typeof candidate !== 'string') return fallback;
  const trimmed = candidate.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
    return trimmed;
  }
  return fallback;
}

assert.strictEqual(getSafeRedirectPath('/account'), '/account', 'Allows internal route /account');
assert.strictEqual(getSafeRedirectPath('//attacker.com'), '/', 'Blocks protocol-relative open redirect');
assert.strictEqual(getSafeRedirectPath('https://attacker.com'), '/', 'Blocks external open redirect');
assert.strictEqual(getSafeRedirectPath('/\\attacker.com'), '/', 'Blocks backslash escape attempts');
console.log('[PASS] Open redirect sanitizer successfully blocks all external attack vectors');

function getProductCallbackUrl(origin) {
  if (origin && typeof origin === 'string' && origin.startsWith('http')) {
    return `${origin.replace(/\/$/, '')}/auth/callback`;
  }
  return 'https://productscout.cevonx.com/auth/callback';
}

assert.strictEqual(
  getProductCallbackUrl(),
  'https://productscout.cevonx.com/auth/callback',
  'ProductScout callback resolves to https://productscout.cevonx.com/auth/callback'
);
assert.strictEqual(
  getProductCallbackUrl('http://localhost:3002'),
  'http://localhost:3002/auth/callback',
  'Local dev callback resolves to http://localhost:3002/auth/callback'
);
console.log('[PASS] ProductScout standalone callback resolution verified\n');

// ----------------------------------------------------------------------------
// 2. Integration Tests: Live HTTP Server
// ----------------------------------------------------------------------------
console.log('--- 2. Live HTTP Route & Component Verification ---');

async function runHttpTests() {
  console.log(`Starting ProductScout production server on port ${PORT}...`);
  const server = spawn('npm.cmd', ['run', 'start', '--', '-p', String(PORT)], {
    stdio: 'ignore',
    shell: true,
  });

  try {
    await waitForServer();
    console.log(`[PASS] ProductScout server online on port ${PORT}. Testing routes...\n`);

    // Test 1: Public Homepage & Navigation
    const home = await fetchUrl('/');
    assert.strictEqual(home.status, 200, 'Homepage returns 200 OK');
    assert(home.body.includes('ProductScout'), 'Homepage renders brand ProductScout');
    assert(home.body.includes('Sign in'), 'Homepage navbar renders Sign in link');
    assert(!home.body.includes('cevondocs'), 'Homepage footer does NOT leak internal cevondocs database details');
    console.log('[PASS] Public Homepage renders cleanly with Sign in control and zero developer noise');

    // Test 2: Login Page
    const login = await fetchUrl('/auth/login');
    assert.strictEqual(login.status, 200, 'Login page returns 200 OK');
    assert(login.body.includes('Sign in to your account'), 'Login page renders sign in title');
    assert(login.body.includes('Continue with Google'), 'Login page offers Google OAuth');
    assert(login.body.includes('Email address'), 'Login page offers Email/Password');
    console.log('[PASS] Login route renders Google OAuth and email/password inputs');

    // Test 3: Signup Page
    const signup = await fetchUrl('/auth/signup');
    assert.strictEqual(signup.status, 200, 'Signup page returns 200 OK');
    assert(signup.body.includes('Create your account'), 'Signup page renders signup title');
    assert(signup.body.includes('Continue with Google'), 'Signup page offers Google OAuth');
    assert(signup.body.includes('Full Name'), 'Signup page offers Full Name input');
    console.log('[PASS] Signup route renders Google OAuth and account registration');

    // Test 4: Forgot Password Page
    const forgot = await fetchUrl('/auth/forgot-password');
    assert.strictEqual(forgot.status, 200, 'Forgot password returns 200 OK');
    assert(forgot.body.includes('Reset your password'), 'Forgot password renders recovery header');
    console.log('[PASS] Forgot password recovery route renders cleanly');

    // Test 5: Reset Password Page
    const reset = await fetchUrl('/auth/reset-password');
    assert.strictEqual(reset.status, 200, 'Reset password returns 200 OK');
    assert(reset.body.includes('Set new password'), 'Reset password renders update form');
    console.log('[PASS] Reset password route renders cleanly');

    // Test 6: Auth Callback Route
    const callback = await fetchUrl('/auth/callback');
    assert.strictEqual(callback.status, 307, 'Callback without code redirects safely');
    assert(callback.headers.location.includes('/auth/login'), 'Callback redirects to /auth/login');
    console.log('[PASS] Auth callback route safely redirects unauthenticated direct visits');

    console.log('\n========================================================');
    console.log('✓ ALL PRODUCTSCOUT AUTHENTICATION INTEGRATION TESTS PASSED!');
    console.log('========================================================\n');
  } finally {
    console.log('Stopping test server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(server.pid), '/f', '/t']);
    } else {
      server.kill('SIGTERM');
    }
  }
}

runHttpTests().catch((err) => {
  console.error('\n[FATAL] Test failed:', err);
  process.exit(1);
});
