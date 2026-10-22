// Presentation-only inference. Never equate commit messages with functional proof.
export type CommitRow={sha:string;date:string;title:string};
export type WorkRow={kind?:string;title:string;labels:string[];draft?:boolean};
const AI_NAMES=["ChatGPT","Antigravity","Z.ai","Claude","Me"] as const;
export function declaredAI(message:string):string|null{
 const explicit=message.match(/\[(?:ai|agent)\s*:\s*(ChatGPT|Antigravity|Z\.ai|Claude|Me)\]/i)
  ||message.match(/\b(?:made|generated|authored|built)\s+(?:by|with)\s+(ChatGPT|Antigravity|Z\.ai|Claude|Me)\b/i)
  ||message.match(/^Co-authored-by:\s*(ChatGPT|Antigravity|Z\.ai|Claude|Me)\b/im);
 const match=explicit?.[1];
 return AI_NAMES.find(name=>name.toLowerCase()===(match||"").toLowerCase())||null;
}
export function commitKind(title:string):string{
 if(/^(fix|bugfix|hotfix)(\(|:|\s|!)/i.test(title))return "Reported fix";
 if(/^(feat|add|create)(\(|:|\s|!)/i.test(title))return "Reported addition";
 if(/^(revert|remove|delete)(\(|:|\s|!)/i.test(title))return "Reported removal";
 if(/^(docs?)(\(|:|\s|!)/i.test(title))return "Docs update";
 return "Change";
}
export function priorityForWork(work:WorkRow):number{
 if(work.kind==="pr")return work.draft?2:1;
 const labels=work.labels.map(label=>label.toLowerCase());
 if(labels.some(label=>/\b(critical|urgent|blocker|bug|security|p0|p1)\b/.test(label)))return 3;
 if(labels.some(label=>/\b(high|priority|blocked|needs-review)\b/.test(label)))return 2;
 return 1;
}
export function groupForWork(work:WorkRow):string{
 for(const label of work.labels){
  const match=label.match(/^(?:area|feature|component):\s*(.+)$/i);
  if(match)return match[1].trim().slice(0,80);
 }
 return "Uncategorized work";
}
export function timelineForCommits(commits:CommitRow[]):Array<{day:string;count:number;sha:string;title:string}>{
 const ascending=[...commits].filter(c=>Number.isFinite(Date.parse(c.date))).sort((a,b)=>a.date.localeCompare(b.date));
 const frames:Array<{day:string;count:number;sha:string;title:string}>=[];
 ascending.forEach((c,i)=>{
  const day=c.date.slice(0,10);
  if(frames.length&&frames[frames.length-1].day===day)frames[frames.length-1]={day,count:i+1,sha:c.sha,title:c.title};
  else frames.push({day,count:i+1,sha:c.sha,title:c.title});
 });
 return frames;
}
