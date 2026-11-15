import test from 'node:test';
import assert from 'node:assert/strict';
import { sha256hex, expectedToken } from '../lib/auth.ts';

test('sha256hex returns correct hex string', async () => {
  const result = await sha256hex('test');
  assert.equal(result, '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
});

test('expectedToken returns null if PORTAL_PASSPHRASE is not set', async () => {
  const original = process.env.PORTAL_PASSPHRASE;
  delete process.env.PORTAL_PASSPHRASE;

  const result = await expectedToken();
  assert.equal(result, null);

  if (original !== undefined) {
    process.env.PORTAL_PASSPHRASE = original;
  }
});

test('expectedToken returns sha256hex of PORTAL_PASSPHRASE if set', async () => {
  const original = process.env.PORTAL_PASSPHRASE;
  process.env.PORTAL_PASSPHRASE = 'my-secret';

  const result = await expectedToken();
  assert.equal(result, '186ef76e9d6a723ecb570d4d9c287487d001e5d35f7ed4a313350a407950318e'); // "my-secret" hashed

  if (original !== undefined) {
    process.env.PORTAL_PASSPHRASE = original;
  } else {
    delete process.env.PORTAL_PASSPHRASE;
  }
});
