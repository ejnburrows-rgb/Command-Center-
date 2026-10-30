const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run tests/run-backend-tests.sh');

const { loadInventory } = require(path.join(root, 'art-inventory.js'));

test('loadInventory throws on archival ref commit lookup failure', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    return { ok: false, status: 404 };
  };
  try {
    await assert.rejects(
      loadInventory('bad-ref'),
      /GitHub commit lookup failed for archival ref "bad-ref" \(404\)/
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('loadInventory throws on main branch commit lookup failure', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    if (url.includes('commits/bad-ref')) {
      return { ok: true, json: async () => ({ sha: 'abcdef' }) };
    }
    if (url.includes('commits/main')) {
      return { ok: false, status: 500 };
    }
    return { ok: false, status: 404 };
  };
  try {
    await assert.rejects(
      loadInventory('bad-ref'),
      /GitHub commit lookup failed for main branch \(500\)/
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('loadInventory throws on archival file read failure', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    if (url.includes('commits/bad-ref')) {
      return { ok: true, json: async () => ({ sha: 'abcdef123' }) };
    }
    if (url.includes('commits/main')) {
      return { ok: true, json: async () => ({ sha: 'abcdef456' }) };
    }
    if (url.includes('slots-render.json')) {
      return { ok: false, status: 403 };
    }
    return { ok: true, json: async () => ({}), text: async () => "" };
  };
  try {
    await assert.rejects(
      loadInventory('bad-ref'),
      /Could not read archival docs\/art-inventory\/slots-render.json at abcdef1 \(403\)/
    );
  } finally {
    global.fetch = originalFetch;
  }
});
