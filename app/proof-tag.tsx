"use client";
export default function ProofTag({verified,href}:{verified:boolean;href?:string}){
 const label=verified?"VERIFIED":"UNVERIFIED";
 if(href)return <a className={"proof "+(verified?"proof-verified":"proof-unverified") } href={href} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} aria-label={"Proof: "+label+" — open GitHub source"}>Proof · {label} ↗</a>;
 return <span className="proof proof-unverified">Proof · {label}</span>;
}
export function Skeleton({lines=3}:{lines?:number}){return <div className="skeleton-stack" aria-label="Loading data" aria-busy="true">{Array.from({length:lines},(_,i)=><span key={i} className="skeleton-line" style={{width:(i%3===0?"82%":i%3===1?"100%":"64%")}}/>)}</div>}
