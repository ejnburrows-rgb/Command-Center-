"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import ZenzapRoom from "./zenzap-room";

type ProviderId="zai"|"openai"|"gemini";
type Entry={id:string;role:"user"|"assistant"|"error";text:string;provider?:ProviderId;time:number};
type Thread={id:string;name:string;recipients:ProviderId[];entries:Entry[];updated:number};
type Provider={id:ProviderId;label:string;connected:boolean;mode:string;page:string};
type Project={slug:string;name:string;issues:number|null;prs:number|null;stale?:boolean;url:string};
const palette:Record<ProviderId,{initial:string;label:string}> = {
 zai:{initial:"Z",label:"Z.ai · GLM"},
 openai:{initial:"O",label:"OpenAI API"},
 gemini:{initial:"G",label:"Gemini API"}
};
const starter:Thread[]=[{id:"team",name:"Agent team",recipients:["zai","openai","gemini"],entries:[],updated:0}];
const websites=[
 {label:"ChatGPT account",url:"https://chatgpt.com/",detail:"Web session — not directly connected"},
 {label:"Z.ai account",url:"https://chat.z.ai/",detail:"Web session — not directly connected"},
 {label:"Qwen account",url:"https://chat.qwen.ai/",detail:"Web session — not directly connected"},
 {label:"Antigravity",url:"https://antigravity.google/",detail:"Desktop service — not directly connected"},
 {label:"Zenzap",url:"https://www.zenzap.co/",detail:"Messaging account — not directly connected"}
];
const newId=()=>globalThis.crypto?.randomUUID?.()||String(Date.now())+"-"+Math.random().toString(36).slice(2);
const fmt=(n:number)=>n?new Date(n).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";
function entryFor(role:Entry["role"],text:string,provider?:ProviderId):Entry{return {id:newId(),role,text,provider,time:Date.now()};}
export default function AgentStudio(){
 const [threads,setThreads]=useState<Thread[]>(starter);
 const [current,setCurrent]=useState("team");
 const [draft,setDraft]=useState("");
 const [providers,setProviders]=useState<Provider[]>([]);
 const [zenzapReady,setZenzapReady]=useState(false);
 const [projects,setProjects]=useState<Project[]>([]);
 const [ready,setReady]=useState(false);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const [allowCharges,setAllowCharges]=useState(false);
 const [panel,setPanel]=useState<"chat"|"connections"|"projects"|"zenzap">("chat");
 const [navOpen,setNavOpen]=useState(false);
 const [appearance,setAppearance]=useState<"dark"|"light">("dark");
 const bottom=useRef<HTMLDivElement>(null);
 const controller=useRef<AbortController|null>(null);
 const active=threads.find(t=>t.id===current)||threads[0];
 const connected=providers.filter(p=>p.connected);
 const selected=active.recipients.filter(id=>connected.some(p=>p.id===id));
 useEffect(()=>{
   try{
     const data=JSON.parse(localStorage.getItem("nbo-studio-threads-v1")||"null");
     if(Array.isArray(data?.threads) && data.threads.length<=80){
       const cleaned=data.threads.filter((t:Thread)=>typeof t.id==="string" && Array.isArray(t.entries) && Array.isArray(t.recipients));
       if(cleaned.length){setThreads(cleaned);setCurrent(cleaned.some((t:Thread)=>t.id===data.current)?data.current:cleaned[0].id);}
     }
     if(localStorage.getItem("nbo-studio-appearance")==="light")setAppearance("light");
   }catch{}
   setReady(true);
   fetch("/api/studio/providers",{cache:"no-store"}).then(r=>{if(r.status===401){window.location.assign("/login?from=/");return null;}return r.ok?r.json():null;}).then(data=>{if(data?.providers){setProviders(data.providers);setZenzapReady(Boolean(data.zenzapConnected));}else setNotice("Connection status is unavailable.");}).catch(()=>setNotice("Connection status is unavailable."));
   fetch("/api/hub",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{if(Array.isArray(data?.projects))setProjects(data.projects.slice(0,8));}).catch(()=>{});
 },[]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem("nbo-studio-threads-v1",JSON.stringify({threads:threads.slice(0,80),current}));}catch{setNotice("This browser could not save your conversations.");}},[threads,current,ready]);
 useEffect(()=>{if(!ready)return;localStorage.setItem("nbo-studio-appearance",appearance);},[appearance,ready]);
 useEffect(()=>{bottom.current?.scrollIntoView({block:"end",behavior:"smooth"});},[active.entries.length,busy,current]);
 const sorted=useMemo(()=>[...threads].sort((a,b)=>b.updated-a.updated),[threads]);
 const updateThread=(id:string,change:(t:Thread)=>Thread)=>setThreads(ts=>ts.map(t=>t.id===id?change(t):t));
 function startThread(name="New conversation",recipients:ProviderId[]=["zai","openai","gemini"]){
   const id=newId();setThreads(ts=>[{id,name,recipients,entries:[],updated:Date.now()},...ts]);setCurrent(id);setPanel("chat");setNavOpen(false);setNotice("");setDraft("");
 }
 function toggleRecipient(id:ProviderId){
   if(busy)return;
   updateThread(active.id,t=>({...t,recipients:t.recipients.includes(id)?t.recipients.filter(p=>p!==id):[...t.recipients,id]}));
 }
 async function send(){
   const text=draft.trim();
   if(busy||!text)return;
   if(!selected.length){setNotice("No selected agent is connected. Open Connections to see which providers are available.");setPanel("connections");return;}
   if(!allowCharges){setNotice("Confirm provider API usage and any applicable charges before sending.");return;}
   const thread=active;
   const message=entryFor("user",text);
   const history=thread.entries.filter(m=>m.role==="user"||m.role==="assistant").slice(-12).map(m=>({role:m.role,content:m.role==="assistant"&&m.provider?palette[m.provider].label+": "+m.text:m.text}));
   updateThread(thread.id,t=>({...t,name:t.entries.length?t.name:text.slice(0,44),entries:[...t.entries,message].slice(-150),updated:Date.now()}));
   setDraft("");setNotice("");setBusy(true);
   const abort=new AbortController();controller.current=abort;
   try{
     const res=await fetch("/api/studio/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,recipients:selected,history,allowProviderCharges:true}),signal:abort.signal});
     const data=await res.json().catch(()=>({error:"Response was not readable."}));
     if(!res.ok)throw new Error(data.error||"Request failed.");
     const answers:Entry[]=Array.isArray(data.results)?data.results.map((r:{id:ProviderId;content?:string;error?:string})=>entryFor(r.content?"assistant":"error",r.content||r.error||"No response",r.id)):[entryFor("error","No provider response was returned.")];
     updateThread(thread.id,t=>({...t,entries:[...t.entries,...answers].slice(-150),updated:Date.now()}));
   }catch(e){if(!abort.signal.aborted)updateThread(thread.id,t=>({...t,entries:[...t.entries,entryFor("error",e instanceof Error?e.message:"Connection failed.")].slice(-150),updated:Date.now()}));}
   finally{controller.current=null;setBusy(false);}
 }
 function stop(){controller.current?.abort();setBusy(false);setNotice("Request canceled in this browser. The provider may already have processed it.");}
 async function signOut(){await fetch("/api/auth",{method:"DELETE"});window.location.assign("/login");}
 return <div className={"agent-studio studio-"+appearance}>
   {navOpen&&<button className="studio-overlay" aria-label="Close navigation" onClick={()=>setNavOpen(false)}/>}
   <aside className={"studio-sidebar"+(navOpen?" is-open":"")}>
     <div className="studio-brand"><span className="studio-mark">N</span><div><strong>NBO Studio</strong><small>YOUR AI WORKSPACE</small></div></div>
     <button className="studio-new" onClick={()=>startThread()}><span>＋</span> New conversation</button>
     <p className="studio-side-heading">WORKSPACE</p>
     <button className={"studio-side-action"+(panel==="chat"?" is-current":"")} onClick={()=>{setPanel("chat");setNavOpen(false);}}>◈ &nbsp; Conversations</button>
     <button className={"studio-side-action"+(panel==="connections"?" is-current":"")} onClick={()=>{setPanel("connections");setNavOpen(false);}}>◎ &nbsp; Agents & connections <span>{connected.length}</span></button>
     <button className={"studio-side-action"+(panel==="zenzap"?" is-current":"")} onClick={()=>{setPanel("zenzap");setNavOpen(false);}}>◌ &nbsp; Zenzap messages <span>{zenzapReady?"Ready":"—"}</span></button>
     <button className={"studio-side-action"+(panel==="projects"?" is-current":"")} onClick={()=>{setPanel("projects");setNavOpen(false);}}>▦ &nbsp; Projects</button>
     <p className="studio-side-heading">RECENT CONVERSATIONS</p>
     <div className="studio-threads">{sorted.map(t=><button key={t.id} className={"studio-thread"+(t.id===current&&panel==="chat"?" is-current":"")} onClick={()=>{setCurrent(t.id);setPanel("chat");setNavOpen(false);}}><span>{t.recipients.length>1?"◉":"○"}</span><span>{t.name}</span></button>)}</div>
     <div className="studio-side-footer"><Link href="/overview">Project operations & evidence <span>↗</span></Link><span>GitHub-backed overview retained</span></div>
   </aside>
   <section className="studio-main">
     <header className="studio-topbar">
       <div className="studio-top-left"><button className="studio-hamburger" aria-label="Open navigation" onClick={()=>setNavOpen(true)}>☰</button><div><strong>{panel==="chat"?active.name:panel==="connections"?"Agents & connections":panel==="zenzap"?"Zenzap messages":"Projects"}</strong><small>{panel==="chat"?"Private owner workspace":"NBO Studio"}</small></div></div>
       <div className="studio-top-actions"><span className="studio-live"><i/> {connected.length} API {connected.length===1?"provider":"providers"} ready</span><button title="Toggle appearance" aria-label="Toggle light or dark mode" onClick={()=>setAppearance(v=>v==="dark"?"light":"dark")}>{appearance==="dark"?"☼":"☾"}</button><button title="Sign out" onClick={()=>void signOut()}>Sign out</button></div>
     </header>
     {panel==="chat"&&<>
       <div className="studio-conversation" role="log" aria-label="Conversation">
         {active.entries.length===0&&<div className="studio-welcome">
           <div className="studio-orb"><span>✦</span></div>
           <span className="studio-kicker">NBO · INTELLIGENT WORKSPACE</span>
           <h1>Your agents, one conversation.</h1>
           <p>Message connected agents together, inspect your projects, and keep decisions in one clear place.</p>
           <div className="studio-quick"><button onClick={()=>setDraft("Review the current state of La Cartilla de Gretel and identify the most important next step.")}>Review La Cartilla de Gretel <span>↗</span></button><button onClick={()=>setDraft("Compare two independent approaches to improving the LANY Books storefront.")}>Compare approaches <span>↗</span></button><button onClick={()=>setPanel("connections")}>Check my connections <span>↗</span></button></div>
         </div>}
         {active.entries.map(m=><article className={"studio-message studio-message-"+m.role} key={m.id}><div className="studio-avatar">{m.role==="user"?"Y":m.role==="error"?"!":palette[m.provider||"zai"].initial}</div><div className="studio-msg-body"><div className="studio-msg-meta"><strong>{m.role==="user"?"You":m.role==="error"?(m.provider?palette[m.provider].label+" · Error":"Request error"):palette[m.provider||"zai"].label}</strong><span>{fmt(m.time)}</span></div><p>{m.text}</p></div></article>)}
         {busy&&<div className="studio-working"><span className="studio-spinner"/> Waiting for provider responses…</div>}
         <div ref={bottom}/>
       </div>
       <div className="studio-composer-wrap">
         {notice&&<p className="studio-alert" role="alert">{notice}</p>}
         <div className="studio-recipient-heading"><span>MESSAGE</span><strong>{active.recipients.length>1?"Agent team":"Selected agent"}</strong></div>
         <div className="studio-recipient-row">{(Object.keys(palette) as ProviderId[]).map(id=>{const connected=providers.some(p=>p.id===id&&p.connected);const checked=active.recipients.includes(id);return <button key={id} disabled={busy} className={"studio-pill"+(checked?" selected":"")+(connected?" connected":" disconnected")} aria-pressed={checked} onClick={()=>toggleRecipient(id)}><span className="studio-pill-dot"/>{palette[id].label}{!connected?" · offline":""}</button>})}</div>
         <div className="studio-composer"><textarea aria-label="Write a message to your agents" rows={2} placeholder={connected.length?"Message your connected agents…":"Connect a provider to start messaging…"} value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send();}}}/><div className="studio-composer-bottom"><label className="studio-cost-check"><input type="checkbox" checked={allowCharges} onChange={e=>setAllowCharges(e.target.checked)}/> Allow provider API usage and applicable charges</label>{busy?<button className="studio-send" onClick={stop}>Stop</button>:<button className="studio-send" onClick={()=>void send()} disabled={!draft.trim()}>Send ↑</button>}</div></div>
         <p className="studio-storage">Conversation history is stored on this browser only. Cross-device sync is not yet connected. No simulated agent replies.</p>
       </div>
     </>}
     {panel==="connections"&&<div className="studio-directory"><span className="studio-kicker">CONNECTED WORKSPACE</span><h1>Agents & connections</h1><p>Only authenticated and configured services can receive messages. Your existing web subscriptions are not interchangeable with API access.</p><div className="studio-directory-grid">{(Object.keys(palette) as ProviderId[]).map(id=>{const p=providers.find(v=>v.id===id);return <article key={id} className="studio-provider-card"><span className="studio-provider-avatar">{palette[id].initial}</span><div><h3>{palette[id].label}</h3><p>{p?.mode||"Server-side API key"}</p></div><span className={"studio-provider-status"+(p?.connected?" ready":"")}>{p?.connected?"Connected":"Not connected"}</span><p className="studio-provider-help">{p?.connected?"Provider credential is configured on the server. Live chat still requires a successful request.":"Requires an authorized credential configured securely in Vercel. No browser credential is collected."}</p><a href={p?.page||(id==="zai"?"https://chat.z.ai/":id==="openai"?"https://chatgpt.com/":"https://gemini.google.com/")} target="_blank" rel="noreferrer">Open provider website ↗</a></article>})}</div><h2>Zenzap team messaging</h2><p>{zenzapReady?"Zenzap bot credentials are configured. Open Messages to check channel access and send real messages.":"Not connected. Server-side Zenzap API key and secret or OAuth bot credentials are required."}</p><button className="studio-z-open" onClick={()=>setPanel("zenzap")}>Open Zenzap conversations →</button><h2>Other accounts</h2><div className="studio-web-list">{websites.map(w=><a key={w.label} href={w.url} target="_blank" rel="noreferrer"><strong>{w.label}</strong><small>{w.detail}</small><span>↗</span></a>)}</div><p className="studio-directory-note">Connecting a browser account to a separate product requires an official supported login or integration. These external links are not agent connections.</p></div>}
     {panel==="zenzap"&&<ZenzapRoom enabled={zenzapReady}/>}
     {panel==="projects"&&<div className="studio-directory"><span className="studio-kicker">LIVE GITHUB SOURCES</span><h1>Your projects</h1><p>Project statuses come from the existing NBO GitHub evidence feed. Open the full operations view for details.</p><div className="studio-project-grid">{projects.length?projects.map(p=><a href={p.url} key={p.slug} target="_blank" rel="noreferrer" className="studio-project"><span>▦</span><strong>{p.name}</strong><small>{p.stale?"Source stale":p.issues===null?"Source unavailable":p.issues+" open issues · "+(p.prs??"—")+" PRs"}</small><b>↗</b></a>):<p>Project feed is unavailable. <Link href="/overview">Open project overview</Link></p>}</div><Link href="/overview" className="studio-project-link">Open full GitHub operations and evidence ↗</Link></div>}
   </section>
   <nav className="studio-mobile-nav" aria-label="Workspace navigation"><button className={panel==="chat"?"active":""} onClick={()=>setPanel("chat")}>◉ <span>Chat</span></button><button className={panel==="connections"?"active":""} onClick={()=>setPanel("connections")}>◎ <span>Agents</span></button><button className={panel==="zenzap"?"active":""} onClick={()=>setPanel("zenzap")}>◌ <span>Zenzap</span></button><button className={panel==="projects"?"active":""} onClick={()=>setPanel("projects")}>▦ <span>Projects</span></button><Link href="/overview">≡ <span>Overview</span></Link></nav>
 </div>;
}
