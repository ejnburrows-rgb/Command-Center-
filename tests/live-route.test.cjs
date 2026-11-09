const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.env.NBO_LIVE_BUILD;
if (!root) throw new Error('Run with tests/run-backend-tests.sh');

const buildPath = path.join(root, 'route', 'app/api/live/route.js');

test('live check website route caching', async (t) => {
  const serverPath = require.resolve('next/server');
  require.cache[serverPath] = {
    id: serverPath,
    filename: serverPath,
    loaded: true,
    exports: {
      NextRequest: class {
        constructor(url, searchParams = new URLSearchParams()) {
          this.url = url;
          this.nextUrl = { searchParams };
        }
      },
      NextResponse: {
        json: (body, init) => ({ body, init }),
      }
    }
  };

  let mockImpl = async () => {};
  let callCount = 0;

  const mockLiveCheckModule = {
    checkWebsite: async (...args) => {
      callCount++;
      return mockImpl(...args);
    },
  };

  const liveCheckPath = require.resolve(path.join(root, 'live-check.js'));
  require.cache[liveCheckPath] = {
    id: liveCheckPath,
    filename: liveCheckPath,
    loaded: true,
    exports: mockLiveCheckModule
  };

  const route = require(buildPath);

  await t.test('url too long', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('url', 'a'.repeat(2049));
    const req = new (require('next/server').NextRequest)('http://localhost', searchParams);

    const res = await route.GET(req);
    assert.deepEqual(res, {
      body: { error: 'URL is too long' },
      init: { status: 400 }
    });
  });

  await t.test('success path caches results', async () => {
    callCount = 0;
    const successResult = {
        url: 'https://example.com/',
        checkedAt: '2026-11-01T18:15:25.755Z',
        status: 200,
        success: true
    };
    mockImpl = async () => successResult;

    const searchParams = new URLSearchParams();
    const url = 'https://example.com';
    searchParams.set('url', url);
    const req = new (require('next/server').NextRequest)('http://localhost', searchParams);

    // First call caches the result
    const res1 = await route.GET(req);
    assert.equal(res1.body.url, successResult.url);
    assert.equal(res1.body.status, successResult.status);
    assert.equal(callCount, 1);

    // Second call within 30s uses cache
    const res2 = await route.GET(req);
    assert.equal(res2.body.url, successResult.url);
    assert.equal(callCount, 1); // call count shouldn't increase
  });

  await t.test('error path', async () => {
    callCount = 0;
    mockImpl = async () => { throw new Error('Network error'); };

    const searchParams = new URLSearchParams();
    const url = 'https://example.org/error';
    searchParams.set('url', url);
    const req = new (require('next/server').NextRequest)('http://localhost', searchParams);

    const res = await route.GET(req);
    assert.equal(res.body.url, url);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Network error');
    assert.ok(typeof res.body.checkedAt === 'string');
    assert.equal(callCount, 1);
  });

  await t.test('cache eviction at 200 items', async () => {
    callCount = 0;
    mockImpl = async (url) => ({ success: true, url });

    for (let i = 0; i < 205; i++) {
      const searchParams = new URLSearchParams();
      searchParams.set('url', `https://example.com/${i}`);
      const req = new (require('next/server').NextRequest)('http://localhost', searchParams);
      await route.GET(req);
    }

    const searchParams = new URLSearchParams();
    searchParams.set('url', `https://example.com/0`);
    const req = new (require('next/server').NextRequest)('http://localhost', searchParams);
    await route.GET(req);

    assert.equal(callCount, 205 + 1); // 205 inserts + 1 re-insert because it was evicted
  });
});
