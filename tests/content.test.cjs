const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run tests/run-backend-tests.sh');

test('getItem handles missing content item (404)', async (t) => {
  const contentPath = path.join(root, 'content.js');
  const githubPath = path.join(root, 'github.js');

  const GITHUB_TOKEN_READ = process.env.GITHUB_TOKEN_READ;
  process.env.GITHUB_TOKEN_READ = 'test-token';

  const github = require(githubPath);

  const mockOctokit = {
    repos: {
      getContent: async () => {
        const err = new Error('Not Found');
        err.status = 404;
        throw err;
      }
    }
  };

  t.mock.method(github, 'readClient', () => mockOctokit);
  t.mock.method(github, 'writeClient', () => mockOctokit);

  const { getItem } = require(contentPath);

  const result = await getItem('prompts', 'missing-slug');
  assert.equal(result, null);

  if (GITHUB_TOKEN_READ !== undefined) {
    process.env.GITHUB_TOKEN_READ = GITHUB_TOKEN_READ;
  } else {
    delete process.env.GITHUB_TOKEN_READ;
  }
});
