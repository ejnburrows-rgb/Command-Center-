import test from "node:test";
import assert from "node:assert/strict";
import {isCurrentZenzapResponse} from "../lib/zenzap-request-guard.mjs";
test("a response from an earlier channel must not overwrite the selected channel",()=>{
 assert.equal(isCurrentZenzapResponse("channel-A","channel-B",3,3),false);
});
test("an older response for the same channel cannot replace newer refresh results",()=>{
 assert.equal(isCurrentZenzapResponse("channel-A","channel-A",2,3),false);
});
test("only a response matching current channel and latest request is accepted",()=>{
 assert.equal(isCurrentZenzapResponse("channel-A","channel-A",3,3),true);
 assert.equal(isCurrentZenzapResponse("","",3,3),false);
});
