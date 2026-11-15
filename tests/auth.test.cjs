const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.env.NBO_TEST_BUILD;
if (!root) throw new Error('Run with tests/run-backend-tests.sh');

const { POST } = require(path.join(root, 'app/api/auth/route.js'));

test('auth POST returns 400 Bad request when req.json() throws', async () => {
  // Set the required environment variable
  process.env.PORTAL_PASSPHRASE = 'secret';

  // Mock Request where json() throws an error
  const req = {
    json: async () => {
      throw new Error('mock error');
    }
  };

  // Call the POST handler
  const res = await POST(req);

  // Assert the expected response
  assert.equal(res.status, 400);

  const data = await res.json();
  assert.deepEqual(data, { error: 'Bad request.' });
});
