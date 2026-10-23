"use client";
import {usePremium,type Palette,type Appearance,type WorkspaceMode,paletteLabels,workspaceLabels} from "./premium-preferences";
import {Icon,External} from "./hub-ui";
const palettes:Palette[]=["blue","purple","teal","mono"];
const workspaces:WorkspaceMode[]=["overview","coding","review","focus"];
export default function SettingsView({auto,setAuto,refresh,busy,errors}:{theme:string;setTheme:(v:string)=>void;auto:boolean;setAuto:(v:boolean)=>void;refresh:()=>void;busy:boolean;errors:number}){
 const {palette,setPalette,appearance,setAppearance,workspace,setWorkspace}=usePremium();
 return <div className="settings-grid premium-settings">
  <section className="panel"><h2>Appearance</h2><p className="muted">A clean interface that works in light or dark, across every section.</p>
   <div className="setting-choice-group" role="group" aria-label="Appearance"><span className="setting-mini-label">DISPLAY</span><div className="appearance-options">{(["light","dark"] as Appearance[]).map(a=><button key={a} type="button" aria-pressed={appearance===a} onClick={()=>setAppearance(a)}>{a==="light"?"☀ Light":"◐ Dark"}</button>)}</div></div>
   <div className="setting-choice-group" role="group" aria-label="Colors"><span className="setting-mini-label">COLOR PALETTE</span><div className="palette-options">{palettes.map(c=><button type="button" key={c} data-color={c} aria-pressed={palette===c} onClick={()=>setPalette(c)}><i/>{paletteLabels[c]}</button>)}</div></div>
  </section>
  <section className="panel"><h2>Workspace</h2><p className="muted">Each mode makes a different part of AI development easier to see.</p>
   <div className="workspace-options" role="group" aria-label="Workspace mode">{workspaces.map(m=><button key={m} type="button" aria-pressed={workspace===m} onClick={()=>setWorkspace(m)}><b>{workspaceLabels[m]}</b><small>{({overview:"Projects and all outstanding work",coding:"Open issues and code changes",review:"Missing evidence and owner decisions",focus:"One task and its inspection details"} as Record<WorkspaceMode,string>)[m]}</small></button>)}</div>
  </section>
  <section className="panel"><h2>Live data</h2><p className="muted">Read-only GitHub access. Nothing here merges or publishes code.</p>
   <div className="setting-row"><span>Source health</span><b>{errors?"Some sources unavailable":"Connected"}</b></div>
   <div className="setting-row"><span>Auto-refresh every 2 minutes</span><button type="button" className={"switch "+(auto?"on":"")} role="switch" aria-label="Auto-refresh GitHub data" aria-checked={auto} onClick={()=>{setAuto(!auto);try{localStorage.setItem("nbo-auto",auto?"off":"on")}catch{}}}><span/></button></div>
   <button type="button" className="btn secondary" disabled={busy} onClick={refresh}><Icon name="refresh"/> Refresh now</button>
  </section>
  <section className="panel"><h2>Privacy & storage</h2><p className="muted">Your appearance, project pins and work preferences stay on this device. Private knowledge stays behind GitHub sign-in.</p>
   <External className="btn secondary" href="https://github.com/ejnburrows-rgb/Command-Center-">Open repository</External>
  </section>
 </div>;
}
