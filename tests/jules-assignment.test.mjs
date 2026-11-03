import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deriveJulesAssignment } from "../lib/jules-assignment.mjs";
import { findJulesTaskPR } from "../lib/jules-assignment.mjs";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

const issue={number:18,title:"Track Jules task ownership",html_url:"https://github.com/ejnburrows-rgb/Command-Center-/issues/18",created_at:"2026-10-30T03:12:38Z",updated_at:"2026-10-30T03:36:05Z",user:{login:"ejnburrows-rgb"},labels:[{name:"jules"}],assignees:[]};
const timeline=[{event:"labeled",label:{name:"jules"},created_at:"2026-10-30T03:12:43Z",actor:{login:"ejnburrows-rgb"},performed_via_github_app:{name:"ChatGPT Codex Connector"}}];
const accepted={user:{login:"google-labs-jules[bot]"},created_at:"2026-10-30T03:12:48Z",html_url:"https://github.com/ejnburrows-rgb/Command-Center-/issues/18#issuecomment-1",body:"Jules is on it: https://jules.google.com/task/10892341679603989202"};

test("a Jules label means dispatched, not accepted or executing",()=>{
 const result=deriveJulesAssignment({issue,timeline,comments:[],fetchedAt:"2026-10-30T03:40:00Z"});
 assert.equal(result.status,"DISPATCHED — ACCEPTANCE NOT VERIFIED");
 assert.equal(result.accepted,false);
 assert.equal(result.sessionStatus,"UNKNOWN");
 assert.equal(result.assignedBy,"ejnburrows-rgb");
 assert.equal(result.assignmentAt,"2026-10-30T03:12:43Z");
});

test("only the official bot task link proves acceptance and the session remains unknown",()=>{
 const result=deriveJulesAssignment({issue,timeline,comments:[accepted],fetchedAt:"2026-10-30T03:40:00Z"});
 assert.equal(result.status,"ACCEPTED — LIVE SESSION STATUS UNKNOWN");
 assert.equal(result.accepted,true);
 assert.equal(result.assignedAgent,"Jules · accepted; session UNKNOWN");
 assert.equal(result.taskUrl,"https://jules.google.com/task/10892341679603989202");
 assert.equal(result.sessionStatus,"UNKNOWN");
});

test("an official later failure is shown without erasing the earlier acceptance",()=>{
 const failure={...accepted,created_at:"2026-10-30T03:36:05Z",body:"I apologize, but I encountered an unexpected error and wasn't able to complete the [task](https://jules.google.com/task/10892341679603989202)."};
 const result=deriveJulesAssignment({issue,timeline,comments:[accepted,failure],fetchedAt:"2026-10-30T03:40:00Z"});
 assert.equal(result.accepted,true);
 assert.equal(result.status,"FAILED — PROVIDER REPORTED TASK FAILURE");
 assert.equal(result.assignedAgent,"Jules · accepted earlier; latest outcome FAILED");
 assert.equal(result.sessionStatus,"UNKNOWN");
 assert.match(result.latestOutcome,/FAILED/);
 assert.match(result.nextAction,/do not resume or dispatch from this Board/i);
 assert.doesNotMatch(result.nextAction,/resume that same task/i);
});

test("a failed task stays FAILED even when its task-linked PR is independently verified",()=>{
 const failure={...accepted,created_at:"2026-10-30T03:36:05Z",body:"I encountered an unexpected error and wasn't able to complete https://jules.google.com/task/10892341679603989202"};
 const linked={...accepted,created_at:"2026-10-30T03:20:00Z",body:"Task update https://jules.google.com/task/10892341679603989202 and PR https://github.com/ejnburrows-rgb/Command-Center-/pull/31"};
 const pullRequest={number:31,title:"Task output",html_url:"https://github.com/ejnburrows-rgb/Command-Center-/pull/31",state:"open",draft:false,head:{sha:"d".repeat(40)}};
 const result=deriveJulesAssignment({issue,timeline,comments:[accepted,linked,failure],pullRequest,fetchedAt:"2026-10-30T03:40:00Z"});
 assert.equal(result.status,"FAILED — PROVIDER REPORTED TASK FAILURE");
 assert.equal(result.pullRequest?.number,31);
 assert.equal(result.sessionStatus,"UNKNOWN");
 assert.match(result.nextAction,/do not resume or dispatch/i);
});

test("an unrelated bot cannot establish acceptance",()=>{
 const unrelated={...accepted,user:{login:"other-bot[bot]"}};
 const result=deriveJulesAssignment({issue,timeline,comments:[unrelated],fetchedAt:"2026-10-30T03:40:00Z"});
 assert.equal(result.accepted,false);
 assert.equal(result.assignedAgent,"Jules — acceptance not verified");
});

test("only a task-linked PR is classified, with merge separate from deployment",()=>{
 const comment={...accepted,body:"Jules task complete: https://jules.google.com/task/10892341679603989202 and PR https://github.com/ejnburrows-rgb/Command-Center-/pull/31"};
 const open={number:31,title:"Track ownership",html_url:"https://github.com/ejnburrows-rgb/Command-Center-/pull/31",state:"open",draft:false,head:{sha:"a".repeat(40)}};
 const result=deriveJulesAssignment({issue,timeline,comments:[comment],pullRequest:open,fetchedAt:"2026-10-30T03:40:00Z"});
 assert.equal(result.status,"REVIEW-READY — PR OPEN");
 assert.equal(result.pullRequest.state,"OPEN · REVIEW REQUIRED");
 assert.match(result.nextAction,/not merged or live/i);
});

test("an unrelated PR mentioned by the official bot is not correlated to this task",()=>{
 const unrelated={...accepted,body:"Another task finished: https://jules.google.com/task/999999999999 and PR https://github.com/ejnburrows-rgb/Command-Center-/pull/31"};
 const open={number:31,title:"Other task",html_url:"https://github.com/ejnburrows-rgb/Command-Center-/pull/31",state:"open",draft:false,head:{sha:"c".repeat(40)}};
 const result=deriveJulesAssignment({issue,timeline,comments:[accepted,unrelated],pullRequest:open,fetchedAt:"2026-10-30T03:40:00Z"});
 assert.equal(result.pullRequest,null);
 assert.equal(result.status,"ACCEPTED — LIVE SESSION STATUS UNKNOWN");
});

test("a PR description can link to the accepted task ID even when the bot posted its links separately",()=>{
 const acceptedOnly=accepted;
 const linked={number:31,title:"Task result",html_url:"https://github.com/ejnburrows-rgb/Command-Center-/pull/31",state:"open",draft:false,updated_at:"2026-10-30T03:45:00Z",body:"Jules task https://jules.google.com/task/10892341679603989202",head:{sha:"d".repeat(40)}};
 const unrelated={...linked,number:32,body:"Jules task https://jules.google.com/task/999999999999"};
 assert.equal(findJulesTaskPR([unrelated,linked],acceptedOnly.body)?.number,31);
 const result=deriveJulesAssignment({issue,timeline,comments:[acceptedOnly],pullRequest:linked,fetchedAt:"2026-10-30T03:40:00Z"});
 assert.equal(result.status,"REVIEW-READY — PR OPEN");
 assert.equal(result.pullRequest.number,31);
});

test("a draft PR is not shown as ready for review",()=>{
 const comment={...accepted,body:"Jules task update: https://jules.google.com/task/10892341679603989202 and PR https://github.com/ejnburrows-rgb/Command-Center-/pull/31"};
 const draft={number:31,title:"Draft result",html_url:"https://github.com/ejnburrows-rgb/Command-Center-/pull/31",state:"open",draft:true,head:{sha:"b".repeat(40)}};
 const result=deriveJulesAssignment({issue,timeline,comments:[comment],pullRequest:draft,fetchedAt:"2026-10-30T03:40:00Z"});
 assert.equal(result.status,"DRAFT PR — NOT REVIEW-READY");
 assert.match(result.nextAction,/still a draft/i);
});

test("stale or unavailable evidence is explicitly unknown and does not leak credentials",()=>{
 const result=deriveJulesAssignment({issue,timeline,comments:[accepted],fetchedAt:"2026-10-30T03:00:00Z",stale:true});
 assert.equal(result.stale,true);
 assert.equal(result.sessionStatus,"UNKNOWN");
 const json=JSON.stringify(result);
 assert.doesNotMatch(json,/GITHUB_TOKEN|Authorization|secret/i);
 const unavailable=deriveJulesAssignment({error:"GitHub HTTP 503",fetchedAt:""});
 assert.equal(unavailable.status,"UNKNOWN");
 assert.equal(unavailable.assignedAgent,"UNKNOWN");
});

test("the route is read-only and never returns configured GitHub credentials",()=>{
 const route=read("app/api/assignment/route.ts");
 assert.match(route,/export async function GET/);
 assert.doesNotMatch(route,/export async function (POST|PUT|PATCH|DELETE)|writeClient|GITHUB_TOKEN|Authorization/i);
 assert.match(route,/private, no-store/);
});

test("the owner panel reads one source and has no assignment or dispatch control",()=>{
 const panel=read("app/jules-assignment.tsx");
 assert.match(panel,/fetch\("\/api\/assignment"/);
 assert.match(panel,/Live session/);
 assert.match(panel,/UNKNOWN/);
 assert.doesNotMatch(panel,/dispatch|assign now|start agent/i);
});

test("the assignment panel and task handoff share one evidence contract",()=>{
 const panel=read("app/jules-assignment.tsx");
 const handoff=read("app/mission-action-map.tsx");
 const contract=read("lib/jules-assignment-contract.ts");
 assert.match(panel,/JulesAssignmentEvidence/);
 assert.match(handoff,/JulesAssignmentEvidence/);
 assert.match(contract,/sessionStatus\?: "UNKNOWN" \| "ACTIVE" \| "PAUSED" \| "COMPLETED"/);
 assert.match(contract,/pullRequest\?:/);
});
