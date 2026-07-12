import { Octokit } from "@octokit/rest";

// Two separate clients enforce the guardrail at the credential level:
//  - readClient  uses GITHUB_TOKEN_READ  (CRM repos, read-only)
//  - writeClient uses GITHUB_TOKEN_WRITE (command-center only, read+write)
// If a token is missing we throw a clear, actionable error instead of a
// cryptic 401 — but only when the client is actually used, never at build time.

let _read: Octokit | null = null;
let _write: Octokit | null = null;

export function readClient(): Octokit {
  if (_read) return _read;
  const token = process.env.GITHUB_TOKEN_READ;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN_READ is not set. Add a fine-grained token (read-only) for the CRM repos.",
    );
  }
  _read = new Octokit({ auth: token });
  return _read;
}

export function writeClient(): Octokit {
  if (_write) return _write;
  const token = process.env.GITHUB_TOKEN_WRITE;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN_WRITE is not set. Add a fine-grained token (command-center, read+write).",
    );
  }
  _write = new Octokit({ auth: token });
  return _write;
}

export function hasReadToken(): boolean {
  return Boolean(process.env.GITHUB_TOKEN_READ);
}

export function hasWriteToken(): boolean {
  return Boolean(process.env.GITHUB_TOKEN_WRITE);
}
