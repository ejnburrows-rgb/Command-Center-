const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run with tests/run-backend-tests.sh');

const { readClient } = require(path.join(root, 'github.js'));

test('readClient throws actionable error when GITHUB_TOKEN_READ is missing', () => {
  const originalEnv = process.env.GITHUB_TOKEN_READ;
  delete process.env.GITHUB_TOKEN_READ;

  assert.throws(
    () => readClient(),
    /GITHUB_TOKEN_READ is not set\. Add a fine-grained token \(read-only\) for the CRM repos\./
  );

  if (originalEnv !== undefined) {
    process.env.GITHUB_TOKEN_READ = originalEnv;
  }
});
