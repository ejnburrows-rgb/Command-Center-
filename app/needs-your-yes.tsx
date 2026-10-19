"use client";
import type {LanesFeed} from "./lanes-types";
import ProofTag,{Skeleton} from "./proof-tag";
export default function NeedsYourYes({feed,loading,error}:{feed:LanesFeed;loading:boolean;error:string}){
 return <section className="panel needs-panel" aria-label="Needs your yes">
 <div className="needs-heading"><span className="needs-symbol" aria-hidden="true">✓</span><div><h2>Needs your YES</h2><p>Only GitHub work explicitly marked as waiting for an owner decision.</p></div><span className="needs-count">{feed.approvals.length}</span></div>
 {loading&&!feed.checkedAt?<Skeleton lines={2}/>:feed.approvals.length?<div className="needs-list">{feed.approvals.map(item=><div className="need-item" key={item.id}><div><strong>{item.title}</strong><p>{item.reason}</p><ProofTag verified={item.verified} href={item.url}/></div><a className="btn secondary" href={item.url} target="_blank" rel="noopener noreferrer">Review PR ↗</a></div>)}</div>:<p className="needs-empty">{error||feed.partial?"Unable to confirm all approvals. Check GitHub.":"Nothing waiting on you."}</p>}
 </section>;
}
