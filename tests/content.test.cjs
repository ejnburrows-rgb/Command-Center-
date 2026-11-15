const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run with tests/run-backend-tests.sh');

const content = require(path.join(root, 'content.js'));
const github = require(path.join(root, 'github.js'));

test('listContent returns empty array when folder is not found (404)', async (t) => {
  process.env.GITHUB_TOKEN_READ = 'fake-token';

  t.mock.method(github, 'readClient', () => {
    return {
      repos: {
        getContent: async () => {
          const err = new Error('Not Found');
          err.status = 404;
          throw err;
        }
      }
    };
  });

  const result = await content.listContent('prompts');
  assert.deepEqual(result, []);
});

test('listContent propagates non-404 errors', async (t) => {
  process.env.GITHUB_TOKEN_READ = 'fake-token';

  t.mock.method(github, 'readClient', () => {
    return {
      repos: {
        getContent: async () => {
          const err = new Error('Internal Server Error');
          err.status = 500;
          throw err;
        }
      }
    };
  });

  await assert.rejects(content.listContent('prompts'), /Internal Server Error/);
});
