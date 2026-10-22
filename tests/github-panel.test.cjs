const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=process.env.NBO_TEST_BUILD;
if(!root)throw new Error('Run tests/run-backend-tests.sh');
const {declaredAI,commitKind,priorityForWork,timelineForCommits,groupForWork}=require(path.join(root,'github-panel-logic.js'));
test('AI identity is unknown without explicit attribution',()=>{
 assert.equal(declaredAI('Fix ChatGPT integration'),null);
 assert.equal(declaredAI('Update prompt to work with Gemini'),null);
 assert.equal(declaredAI('Fix drawing (made with Antigravity)'),'Antigravity');
 assert.equal(declaredAI('Improve checks [ai:Claude]'),'Claude');
 assert.equal(declaredAI('Merge feature\nCo-authored-by: ChatGPT <noreply@example.com>'),'ChatGPT');
});
test('plain-language change types never assert feature works',()=>{
 assert.equal(commitKind('fix: adjust button'),'Reported fix');
 assert.equal(commitKind('feat: add search'),'Reported addition');
 assert.equal(commitKind('refactor navigation'),'Change');
});
test('issue priority uses explicit labels and draft state, not commit counts',()=>{
 assert.equal(priorityForWork({kind:'issue',labels:['critical'],title:'Broken login'}),3);
 assert.equal(priorityForWork({kind:'issue',labels:['bug'],title:'Some problem'}),3);
 assert.equal(priorityForWork({kind:'pr',labels:[],title:'New feature',draft:true}),2);
 assert.equal(priorityForWork({kind:'issue',labels:[],title:'Enhancement'}),1);
});
test('area labels are respected and never fabricated from a folder name',()=>{
 assert.equal(groupForWork({labels:['area:lessons'],title:'fix'}),'lessons');
 assert.equal(groupForWork({labels:['feature:voice'],title:'fix'}),'voice');
 assert.equal(groupForWork({labels:['bug'],title:'fix'}),'Uncategorized work');
});
test('time-lapse tracks actual available commits, not fabricated file totals',()=>{
 const f=timelineForCommits([{sha:'b',date:'2026-10-22T12:00:00Z',title:'B'},{sha:'a',date:'2026-10-21T12:00:00Z',title:'A'}]);
 assert.deepEqual(f.map(x=>[x.day,x.count]),[['2026-10-21',1],['2026-10-22',2]]);
});
