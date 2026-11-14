"use client";
import {useEffect,useState} from "react";
type Topic={id:string;name:string;type?:string;description?:string};
type Message={id:string;text?:string;content?:{text?:string};senderId?:string;sender?:{name?:string};createdAt?:number};
export default function ZenzapRoom({enabled}:{enabled:boolean}){
  const [topics,setTopics]=useState<Topic[]>([]);
  const [chosen,setChosen]=useState("");
  const [messages,setMessages]=useState<Message[]>([]);
  const [draft,setDraft]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [loaded,setLoaded]=useState(false);
  const [sending,setSending]=useState(false);
  const selected=topics.find(t=>t.id===chosen);
  async function loadTopics(){
    setBusy(true);setError("");
    try{
      const response=await fetch("/api/studio/zenzap",{cache:"no-store"});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Could not load Zenzap topics.");
      setTopics(Array.isArray(data.topics)?data.topics:[]);
      setChosen(old=>old||data.topics?.[0]?.id||"");
      setLoaded(true);
    }catch(e){setError(e instanceof Error?e.message:"Connection unavailable.");}
    finally{setBusy(false);}
  }
  async function loadMessages(topic:string){
    if(!topic)return;
    setBusy(true);setError("");
    try{
      const response=await fetch("/api/studio/zenzap?topic="+encodeURIComponent(topic),{cache:"no-store"});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Could not load Zenzap messages.");
      setMessages(Array.isArray(data.messages)?data.messages:[]);
    }catch(e){setMessages([]);setError(e instanceof Error?e.message:"Connection unavailable.");}
    finally{setBusy(false);}
  }
  useEffect(()=>{if(enabled)void loadTopics();},[enabled]);
  useEffect(()=>{if(enabled&&chosen)void loadMessages(chosen);},[enabled,chosen]);
  async function send(){
    if(!chosen||!draft.trim()||sending)return;
    setSending(true);setError("");
    try{
      const response=await fetch("/api/studio/zenzap",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({topicId:chosen,text:draft.trim()})
      });
      const data=await response.json();
      if(!response.ok||!data.sent)throw new Error(data.error||"Zenzap did not confirm delivery.");
      setDraft("");
      await loadMessages(chosen);
    }catch(e){setError(e instanceof Error?e.message:"Message could not be sent.");}
    finally{setSending(false);}
  }
  if(!enabled)return <div className="studio-directory"><span className="studio-kicker">ZENZAP</span><h1>Team messages</h1><p>Zenzap is not connected. Configure your bot's API key and secret, or OAuth client credentials, in the private Vercel environment. Web account links alone do not grant API access.</p><a className="studio-project-link" href="https://docs.zenzap.co/api-reference/authentication" target="_blank" rel="noreferrer">Official Zenzap connection instructions ↗</a></div>;
  return <div className="studio-z-room">
    <div className="studio-z-head"><div><span className="studio-kicker">CONNECTED MESSAGING</span><h1>Zenzap conversations</h1><p>Real channels available to your authenticated Zenzap bot.</p></div><button onClick={()=>void loadTopics()} disabled={busy}>Refresh channels</button></div>
    {error&&<p role="alert" className="studio-alert">{error}</p>}
    <div className="studio-z-grid">
      <aside className="studio-z-topics"><h2>Channels</h2>{!loaded&&busy?<p>Loading…</p>:!topics.length?<p>No accessible channels returned.</p>:topics.map(t=><button key={t.id} className={chosen===t.id?"active":""} onClick={()=>setChosen(t.id)}><b>{t.name||"Unnamed channel"}</b><small>{t.type||"Conversation"}</small></button>)}</aside>
      <div className="studio-z-chat"><header><strong>{selected?.name||"Select a conversation"}</strong><span>Messages from Zenzap</span></header><div className="studio-z-messages">{busy?<p>Checking live messages…</p>:!messages.length?<p>No messages returned for this channel.</p>:messages.map((m,i)=><article key={m.id||i}><strong>{m.sender?.name||m.senderId||"Member"}</strong><small>{typeof m.createdAt==="number"?new Date(m.createdAt).toLocaleString():""}</small><p>{m.text||m.content?.text||"Unsupported message content"}</p></article>)}</div><div className="studio-z-compose"><label htmlFor="zenzap-message">Message {selected?.name||"channel"}</label><textarea id="zenzap-message" value={draft} disabled={!chosen} onChange={e=>setDraft(e.target.value)} placeholder="Write a real message to this channel…" rows={3}/><button disabled={!chosen||!draft.trim()||sending} onClick={()=>void send()}>{sending?"Sending…":"Send to "+(selected?.name||"channel")+" ↑"}</button></div></div>
    </div>
  </div>;
}
