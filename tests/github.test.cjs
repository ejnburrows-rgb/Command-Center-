const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run tests/run-backend-tests.sh');

const { writeClient } = require(path.join(root, 'github.js'));

test('writeClient throws an explicit error when GITHUB_TOKEN_WRITE is missing', () => {
  // Ensure the environment variable is not set
  const originalToken = process.env.GITHUB_TOKEN_WRITE;
  delete process.env.GITHUB_TOKEN_WRITE;

  try {
    assert.throws(() => {
      writeClient();
    }, /GITHUB_TOKEN_WRITE is not set\. Add a fine-grained token \(command-center, read\+write\)\./);
  } finally {
    // Restore the environment variable if it was set
    if (originalToken !== undefined) {
      process.env.GITHUB_TOKEN_WRITE = originalToken;
    }
  }
});
