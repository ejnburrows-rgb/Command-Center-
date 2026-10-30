const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run with tests/run-backend-tests.sh');

const { sha256hex } = require(path.join(root, 'auth.js'));

test('sha256hex returns correct hash for non-empty string', async () => {
  const hash = await sha256hex('password');
  assert.equal(hash, '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8');
});

test('sha256hex returns correct hash for empty string', async () => {
  const hash = await sha256hex('');
  assert.equal(hash, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

test('sha256hex returns correct hash for unicode string', async () => {
  const hash = await sha256hex('hello world 🌍');
  assert.equal(hash, '1e71fe32476da1ff115b44dfd74aed5c90d68a1d80a2033065e30cff4335211a');
});
