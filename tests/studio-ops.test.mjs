import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeOps } from '../lib/studio-ops.mjs';
const projects = [
 {slug:'cartilla-de-gretel',name:'La Cartilla de Gretel',url:'https://github.com/example/cartilla',issues:12,prs:3,items:[{kind:'issue',number:99,title:'Fix lesson',url:'https://github.com/example/cartilla/issues/99'}],fetchedAt:'2026-11-15T18:00:00Z',stale:false,accessible:true},
 {slug:'lany-books-web',name:'LANY Books',url:'https://github.com/example/lany',issues:null,prs:null,items:[],stale:true,accessible:false}
];
test('answers targeted questions using observed GitHub records, not invented agent progress',()=>{
 const reply=summarizeOps('What is happening with Cartilla?',projects);
 assert.match(reply,/La Cartilla de Gretel/);
 assert.match(reply,/12 open issues/);
 assert.match(reply,/3 open pull requests/);
 assert.match(reply,/#99 Fix lesson/);
 assert.doesNotMatch(reply,/LANY Books/);
});
test('does not treat unavailable repositories as zero open work',()=>{
 const reply=summarizeOps('LANY',projects);
 assert.match(reply,/LANY Books/);
 assert.match(reply,/Unavailable|stale/i);
 assert.doesNotMatch(reply,/0 open issues/);
});
test('says there is no autonomous worker and uses read-only evidence',()=>{
 const reply=summarizeOps('overview',projects);
 assert.match(reply,/read-only GitHub evidence/i);
 assert.match(reply,/not an autonomous coding agent/i);
});
