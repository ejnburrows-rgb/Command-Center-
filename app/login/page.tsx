"use client";
import {useState,Suspense} from "react";
import {useRouter,useSearchParams} from "next/navigation";
function LoginForm(){
 const router=useRouter(),params=useSearchParams();
 const safeFrom=params.get("from")==="/studio"?"/studio":"/";
 const setup=params.get("setup")==="1";
 const [passphrase,setPassphrase]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError("");
  try{
   const response=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({passphrase})});
   if(!response.ok){const body=await response.json().catch(()=>({}));setError(body.error||"Sign-in failed.");return;}
   setPassphrase("");router.replace(safeFrom);router.refresh();
  }catch{setError("Unable to reach the server. Try again.");}
  finally{setBusy(false);}
 }
 return <main className="studio-login-page">
  <div className="studio-login-glow" aria-hidden="true"/>
  <section className="studio-login-card" aria-label="NBO owner sign in">
   <div className="studio-login-logo">N</div>
   <p className="studio-login-kicker">NBO STUDIO · PRIVATE WORKSPACE</p>
   <h1>Welcome back.</h1>
   <p className="studio-login-subtitle">Sign in to your agent workspace and connected project conversations.</p>
   {setup&&<p role="alert" className="studio-login-warning">The owner passphrase is not configured in Vercel. Set PORTAL_PASSPHRASE in the project's private environment settings before signing in.</p>}
   <form onSubmit={submit}>
    <label htmlFor="studio-password">Owner passphrase</label>
    <input id="studio-password" type="password" value={passphrase} onChange={e=>setPassphrase(e.target.value)} autoComplete="current-password" required placeholder="Enter your passphrase" />
    {error&&<p className="studio-login-warning" role="alert">{error}</p>}
    <button type="submit" disabled={busy||!passphrase}>{busy?"Signing in…":"Enter workspace"} <span aria-hidden="true">→</span></button>
   </form>
   <a className="studio-login-public" href="/overview">Open public project overview ↗</a>
   <p className="studio-login-note">Your account credentials and model API keys are never requested on this screen.</p>
  </section>
 </main>;
}
export default function LoginPage(){return <Suspense fallback={<main className="studio-login-page"/>}><LoginForm/></Suspense>;}
