import test from 'node:test';
import assert from 'node:assert/strict';
import {currentExecutionAuthority} from '../lib/execution-authority.mjs';

const only=`# Queue\n## CURRENT OWNER DIRECTIVE — ORGANIZATION ONLY (October 29, 2026)\n**This is the active scope until the owner explicitly resumes product development.** Reconcile GitHub status, active instructions, task ownership and source-of-truth references across Cartilla and LANY Books first. **Do not build or finish Tutor.**\n## Current next product deliverable — existing Gretel Tutor #1073 (not a new lane)\nFinish it!`;

test('the current organization-only owner directive parks historical Tutor instructions',()=>{
  const result=currentExecutionAuthority(only);
  assert.equal(result.mode,'ORGANIZATION_ONLY');
  assert.equal(result.productWorkAuthorized,false);
  assert.match(result.nextStep,/Cartilla.*LANY/i);
});

test('historical Tutor heading without a current directive never grants a model new work',()=>{
  const result=currentExecutionAuthority('## Current next product deliverable — existing Gretel Tutor #1073\nBuild now');
  assert.equal(result.mode,'UNKNOWN');
  assert.equal(result.productWorkAuthorized,false);
});

test('a stale historical directive after a newer one cannot override the first current directive',()=>{
  const result=currentExecutionAuthority(only+'\n## CURRENT OWNER DIRECTIVE — PRODUCT DEVELOPMENT (historical)\nWork!');
  assert.equal(result.mode,'ORGANIZATION_ONLY');
});

test('unknown and malformed sources fail closed',()=>{
  for(const body of ['',null,undefined,'## CURRENT OWNER DIRECTIVE — SOMETHING ELSE']) {
    assert.equal(currentExecutionAuthority(body).productWorkAuthorized,false);
  }
});

test('explicit current product authorization can resume already-approved work',()=>{
  const result=currentExecutionAuthority('## CURRENT OWNER DIRECTIVE — PRODUCT DEVELOPMENT\nResume existing work');
  assert.equal(result.mode,'PRODUCT_DEVELOPMENT');
  assert.equal(result.productWorkAuthorized,true);
});
