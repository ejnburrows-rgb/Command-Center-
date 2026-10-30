const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run tests/run-backend-tests.sh');

const { writeClient } = require(path.join(root, 'github.js'));

test('writeClient throws specific Error when GITHUB_TOKEN_WRITE is missing', () => {
  // Store original process.env
  const originalEnv = { ...process.env };

  try {
    delete process.env.GITHUB_TOKEN_WRITE;

    assert.throws(
      () => writeClient(),
      /GITHUB_TOKEN_WRITE is not set\. Add a fine-grained token \(command-center, read\+write\)\./
    );
  } finally {
    // Restore original process.env
    process.env = originalEnv;
  }
});
