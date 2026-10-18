import FileVault from "./file-vault";
import {tools,assets} from "./hub-data";
import {External,Icon} from "./hub-ui";
export function ToolsView(){return <><p className="muted lead">Open these services directly. Links do not imply an account connection.</p><div className="tool-grid">{tools.map(t=><External href={t.url} className="tool-card" key={t.name}><span className="tile-icon"><Icon name="Tools"/></span><span><b>{t.name}</b><small>{t.desc}</small><em>{t.cat}</em></span></External>)}</div></>}
export function AssetsView(){return <><p className="muted lead">Direct links to existing project resources, without replacing original assets.</p><div className="asset-grid">{assets.map(a=><External key={a.name} href={a.url} className="asset-card"><span className="tile-icon"><Icon name="Assets"/></span><small>{a.cat}</small><b>{a.name}</b><span>Open source →</span></External>)}</div><FileVault/></>}
