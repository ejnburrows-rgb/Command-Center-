const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run with tests/run-backend-tests.sh');

const { getItem } = require(path.join(root, 'content.js'));
const { hasReadToken } = require(path.join(root, 'github.js'));

test('individual content item missing returns null', async (t) => {
  const originalFetch = global.fetch;
  let fetchCalls = 0;
  global.fetch = async (...args) => {
    fetchCalls++;
    return new Response(JSON.stringify({ message: "Not Found" }), { status: 404, statusText: "Not Found" });
  };

  const originalReadToken = process.env.GITHUB_TOKEN_READ;
  process.env.GITHUB_TOKEN_READ = "fake-token";

  try {
    const item = await getItem("prompts", "does-not-exist");
    assert.equal(item, null, "Expected null when fetch returns 404");
    assert.ok(fetchCalls > 0, "Fetch should be called");
  } finally {
    global.fetch = originalFetch;
    if (originalReadToken === undefined) {
      delete process.env.GITHUB_TOKEN_READ;
    } else {
      process.env.GITHUB_TOKEN_READ = originalReadToken;
    }
  }
});
