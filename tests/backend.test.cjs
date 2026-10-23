const test=require('node:test');const assert=require('node:assert/strict');const path=require('node:path');
const root=process.env.NBO_TEST_BUILD;if(!root)throw new Error('Run with tests/run-backend-tests.sh');
const {allPages,summarize,snapshot,github}=require(path.join(root,'public-github.js'));
const {canonicalJobs,buildEvidence,eligibleApproval,approvalType,visualArtifact}=require(path.join(root,'job-evidence.js'));
const body=`## Rules\nOwner approves pictures going live, merges to main and final voice.\n## Jobs\n1. **Index card wording.** Details\n2. **Lesson 3 as the archetype.** Details\n3. **Voice.** Details\n4. **Flip chart look.** Waiting on the owner's pick. Hold until then.\n5. **Rollout.** After approval.`;
const comment=(id,text,date='2026-10-19T12:00:00Z')=>({id,body:text,html_url:`https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877#issuecomment-${id}`,updated_at:date});
const prUrl='https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/123';
const screenshot='https://github.com/user-attachments/assets/12345';
const noEvidence={pr:async()=>{throw Error('unavailable')},artifact:async()=>false};
test('paginates all issue/PR records and separates drafts from actual issues',async()=>{
 const calls=[];const entries=Array.from({length:130},(_,i)=>({number:i+1,title:'item',...(i<84?{pull_request:{}}:{})}));
 const all=await allPages('/repos/ejnburrows-rgb/test/issues?state=open',async url=>{calls.push(url);return {data:/[?&]page=1(?:&|$)/.test(url)?entries.slice(0,100):entries.slice(100),headers:new Headers(/[?&]page=1(?:&|$)/.test(url)?{link:'<https://api.github.com/x?page=2>; rel="next"'}:{})};});
 assert.equal(calls.length,2);assert.deepEqual(summarize(all,Array.from({length:84},(_,i)=>({draft:i<81}))),{issues:46,prs:84,drafts:81});
});
test('partial page failure rejects whole count rather than publishing partial totals',async()=>{
 let calls=0;await assert.rejects(allPages('/repos/ejnburrows-rgb/test/issues',async()=>{if(++calls===2)throw Error('GitHub 403 rate limit');return {data:Array.from({length:100},(_,i)=>({number:i+1})),headers:new Headers({link:'<x>; rel="next"'})};}),/403/);
});
test('overlapping pages cannot silently double count after concurrent GitHub changes',async()=>{
 let calls=0;await assert.rejects(allPages('/repos/ejnburrows-rgb/test/issues',async()=>({data:++calls===1?Array.from({length:100},(_,i)=>({number:i+1})):[{number:100}],headers:new Headers()})),/changed during pagination/);
});
test('cache preserves source success timestamp and stale values after failure and repeated polls',async()=>{
 const key='fixture-'+Math.random();const first=await snapshot(key,-1,async()=>({issues:46}));
 const failed=await snapshot(key,1000,async()=>{throw Error('rate limited');});
 const poll=await snapshot(key,1000,async()=>({issues:1}));
 assert.equal(failed.fetchedAt,first.fetchedAt);assert.equal(failed.value.issues,46);assert.equal(failed.stale,true);assert.equal(poll.stale,true);assert.equal(poll.error,'rate limited');assert.equal(poll.fetchedAt,first.fetchedAt);
});
test('403 errors explicit; private metadata blocked; no authorization credential is sent',async()=>{
 const original=global.fetch;let observed;
 try{global.fetch=async(_url,options)=>{observed=options;return new Response('{}',{status:403});};await assert.rejects(github('/repos/ejnburrows-rgb/test'),/rate limit/);assert.equal(observed.headers.Authorization,undefined);
 global.fetch=async()=>new Response(JSON.stringify({private:true}));await assert.rejects(github('/repos/ejnburrows-rgb/test'),/Private repositories/);
 await assert.rejects(github('/repos/other/private'),/outside public/);
 }finally{global.fetch=original;}
});
test('canonical names come only from issue body and preserve owner decision',()=>{
 const jobs=canonicalJobs(body,'2026-10-19');assert.equal(jobs.length,5);assert.equal(jobs[1].title,'Lesson 3 as the archetype');assert.match(jobs[3].ownerDecision,/owner/);assert.equal(jobs[0].status,'UNVERIFIED');
});
test('done without proof is red-state UNVERIFIED with explicit missing evidence',async()=>{
 const {jobs}=await buildEvidence(body,'now',[comment(1,'JOB 1 / STATUS: DONE / PROVEN: finished')],noEvidence);assert.equal(jobs[0].status,'UNVERIFIED');assert.ok(jobs[0].missingEvidence.includes('No verification artifact'));assert.equal(jobs[0].prUrl,undefined);
});
test('verified GitHub PR states retained, but claims plus screenshot never manufacture VERIFIED or LIVE',async()=>{
 const deps={pr:async()=>({html_url:prUrl,state:'open',draft:true}),artifact:async url=>url===screenshot};
 const {jobs}=await buildEvidence(body,'now',[comment(1,`JOB 1 / STATUS: LIVE / TEST: PASSED ${prUrl} ${screenshot}`)],deps);assert.equal(jobs[0].status,'UNVERIFIED');assert.equal(jobs[0].githubState,'PR OPEN');assert.equal(jobs[0].proofUrl,screenshot);
 const merged=await buildEvidence(body,'now',[comment(2,`JOB 2 / STATUS: DONE ${prUrl}`)],{...deps,pr:async()=>({html_url:prUrl,state:'closed',merged_at:'2026-10-19'})});assert.equal(merged.jobs[1].status,'UNVERIFIED');assert.equal(merged.jobs[1].githubState,'MERGED');assert.ok(merged.jobs[1].missingEvidence.includes('Completion claim lacks confirmed acceptance evidence'));
});
test('unrelated numbers, ambiguous multi-job summaries and other-repository PRs never attach',async()=>{
 const {jobs}=await buildEvidence(body,'now',[comment(1,`Lesson 3 complete ${prUrl}`),comment(2,`JOB 1 and JOB 2 complete ${prUrl}`),comment(3,'JOB 5 DONE https://github.com/another/repo/pull/123')],noEvidence);
 assert.equal(jobs[0].prUrl,undefined);assert.equal(jobs[1].prUrl,undefined);assert.equal(jobs[4].prUrl,undefined);
});
test('Needs You requires explicit eligible owner approval and reachable visual proof',()=>{
 const real=comment(1,'JOB 2\nNEEDS FROM OWNER: Approve merge to main');assert.ok(eligibleApproval(real,screenshot));assert.equal(eligibleApproval(real,undefined),undefined);
 assert.equal(approvalType('NEEDS FROM OWNER: Approve a new dashboard'),undefined);assert.equal(approvalType('NEEDS FROM OWNER: None; final voice already approved'),undefined);assert.equal(approvalType('Draft PR for final voice'),undefined);
});
test('all history considered but only latest explicit job reports consume proof/PR requests',async()=>{
 let prCalls=0;const comments=Array.from({length:500},(_,i)=>comment(i,`JOB 1 DONE ${prUrl}`,new Date(1720000000000+i*1000).toISOString()));
 comments.push(comment(501,'JOB 1 IN PROGRESS\nNEEDS FROM OWNER: None','2026-10-19T12:00:00Z'));
 const result=await buildEvidence(body,'now',comments,{pr:async()=>{prCalls++;return {html_url:prUrl,state:'open'}},artifact:async()=>false});
 assert.equal(prCalls,0);assert.equal(result.jobs[0].status,'IN PROGRESS');assert.equal(result.approvals.length,0);
});
test('artifact checks reject private/internal/foreign destinations before any network call',async()=>{
 const original=global.fetch;let calls=0;global.fetch=async()=>{calls++;return new Response('',{status:200,headers:{'Content-Type':'image/png'}});};try{
 for(const url of ['http://127.0.0.1/a.png','https://localhost/a.png','https://example.com/a.png','https://github.com.evil.com/a.png','https://github.com:8443/user-attachments/assets/x'])assert.equal(await visualArtifact(url),false);
 assert.equal(calls,0);assert.equal(await visualArtifact(screenshot),true);assert.equal(calls,1);
 }finally{global.fetch=original;}
});

test('explicit NOT STARTED is not mistaken for started work',async()=>{const {jobs}=await buildEvidence(body,'now',[comment(1,'JOB 1 / STATUS: NOT STARTED')],noEvidence);assert.equal(jobs[0].status,'NOT STARTED');});

test('genuinely ongoing reports keep PR OPEN while exposing independent GitHub state',async()=>{const result=await buildEvidence(body,'now',[comment(1,`JOB 1 / STATUS: IN PROGRESS ${prUrl}`)],{pr:async()=>({html_url:prUrl,state:'open'}),artifact:async()=>false});assert.equal(result.jobs[0].status,'PR OPEN');assert.equal(result.jobs[0].githubState,'PR OPEN');});
