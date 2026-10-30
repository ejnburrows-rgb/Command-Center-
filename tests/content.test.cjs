const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run tests/run-backend-tests.sh');

const contentModulePath = path.join(root, 'content.js');
const githubModulePath = path.join(root, 'github.js');

let githubClientMock = {};
require(githubModulePath); // Preload to safely mock
const githubModule = require.cache[require.resolve(githubModulePath)].exports;

githubModule.readClient = () => {
    return {
        repos: {
            getContent: async (params) => {
                if (githubClientMock.getContent) {
                    return githubClientMock.getContent(params);
                }
                return { data: [] };
            }
        }
    }
}
githubModule.writeClient = githubModule.readClient;

const { listContent } = require(contentModulePath);

test('listContent handles 404 gracefully by returning empty array', async () => {
    githubClientMock.getContent = async () => {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    };
    const res = await listContent('prompts');
    assert.deepEqual(res, []);
});

test('listContent propagates non-404 errors', async () => {
    githubClientMock.getContent = async () => {
        const err = new Error('Server error');
        err.status = 500;
        throw err;
    };
    await assert.rejects(listContent('prompts'), /Server error/);
});
