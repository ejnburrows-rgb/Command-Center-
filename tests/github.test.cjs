const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run tests/run-backend-tests.sh');

const { readClient, writeClient } = require(path.join(root, 'github.js'));

test('readClient throws specific error when GITHUB_TOKEN_READ is missing', () => {
  const originalReadToken = process.env.GITHUB_TOKEN_READ;
  delete process.env.GITHUB_TOKEN_READ;
  try {
    assert.throws(
      () => readClient(),
      {
        name: 'Error',
        message: 'GITHUB_TOKEN_READ is not set. Add a fine-grained token (read-only) for the CRM repos.'
      }
    );
  } finally {
    process.env.GITHUB_TOKEN_READ = originalReadToken;
  }
});

test('writeClient throws specific error when GITHUB_TOKEN_WRITE is missing', () => {
  const originalWriteToken = process.env.GITHUB_TOKEN_WRITE;
  delete process.env.GITHUB_TOKEN_WRITE;
  try {
    assert.throws(
      () => writeClient(),
      {
        name: 'Error',
        message: 'GITHUB_TOKEN_WRITE is not set. Add a fine-grained token (command-center, read+write).'
      }
    );
  } finally {
    process.env.GITHUB_TOKEN_WRITE = originalWriteToken;
  }
});
