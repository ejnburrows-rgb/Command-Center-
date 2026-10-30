const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run tests/run-backend-tests.sh');
const { writeClient, readClient } = require(path.join(root, 'github.js'));

test('writeClient throws when missing GITHUB_TOKEN_WRITE', () => {
  const old = process.env.GITHUB_TOKEN_WRITE;
  delete process.env.GITHUB_TOKEN_WRITE;
  assert.throws(() => writeClient(), /GITHUB_TOKEN_WRITE is not set/);
  if (old) {
    process.env.GITHUB_TOKEN_WRITE = old;
  }
});

test('readClient throws when missing GITHUB_TOKEN_READ', () => {
  const old = process.env.GITHUB_TOKEN_READ;
  delete process.env.GITHUB_TOKEN_READ;
  assert.throws(() => readClient(), /GITHUB_TOKEN_READ is not set/);
  if (old) {
    process.env.GITHUB_TOKEN_READ = old;
  }
});
