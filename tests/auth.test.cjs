const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const Module = require('node:module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  if (id === 'next/server') {
    return {
      NextResponse: {
        json: (body, init) => {
          const res = new Response(JSON.stringify(body), init);
          res.cookies = {
            set: (name, value, options) => {
              if (!res.mockCookies) res.mockCookies = {};
              res.mockCookies[name] = { value, options };
            }
          };
          return res;
        }
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

const buildDir = process.env.NBO_TEST_BUILD || __dirname;
// The tsconfig maintains the app/api/auth structure
const { POST } = require(path.join(buildDir, 'app/api/auth/route.js'));

test('POST missing PORTAL_PASSPHRASE returns 500', async () => {
  const originalPhrase = process.env.PORTAL_PASSPHRASE;
  delete process.env.PORTAL_PASSPHRASE;

  try {
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ passphrase: 'test' }) });
    const res = await POST(req);
    assert.strictEqual(res.status, 500);
    const body = await res.json();
    assert.strictEqual(body.error, 'Server has no PORTAL_PASSPHRASE set.');
  } finally {
    process.env.PORTAL_PASSPHRASE = originalPhrase;
  }
});

test('POST invalid JSON body returns 400', async () => {
  const originalPhrase = process.env.PORTAL_PASSPHRASE;
  process.env.PORTAL_PASSPHRASE = 'correct-phrase';

  try {
    const req = new Request('http://localhost', { method: 'POST', body: 'invalid-json' });
    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'Bad request.');
  } finally {
    process.env.PORTAL_PASSPHRASE = originalPhrase;
  }
});

test('POST incorrect passphrase returns 401', async () => {
  const originalPhrase = process.env.PORTAL_PASSPHRASE;
  process.env.PORTAL_PASSPHRASE = 'correct-phrase';

  try {
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ passphrase: 'wrong' }) });
    const res = await POST(req);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error, 'Incorrect passphrase.');
  } finally {
    process.env.PORTAL_PASSPHRASE = originalPhrase;
  }
});

test('POST correct passphrase returns 200 and sets cookie', async () => {
  const originalPhrase = process.env.PORTAL_PASSPHRASE;
  process.env.PORTAL_PASSPHRASE = 'correct-phrase';
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ passphrase: 'correct-phrase' }) });
    const res = await POST(req);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);

    assert.ok(res.mockCookies);
    assert.ok(res.mockCookies['cc_session']);
    assert.strictEqual(res.mockCookies['cc_session'].options.httpOnly, true);
    assert.strictEqual(res.mockCookies['cc_session'].options.secure, true);
  } finally {
    process.env.PORTAL_PASSPHRASE = originalPhrase;
    process.env.NODE_ENV = originalEnv;
  }
});
