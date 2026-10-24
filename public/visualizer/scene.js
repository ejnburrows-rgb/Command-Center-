/* NBO Data Universe — dependency-free WebGL and Canvas visualization.
 * Only approved public GitHub metadata is retrieved. User imports never leave the browser.
 */
(()=>{"use strict";
window.NBOGraphMount=function(root){
const windowCleanup=[];
function onWindowEvent(name,fn){window.addEventListener(name,fn);windowCleanup.push(()=>window.removeEventListener(name,fn));}
let disposed=false,frameId=0;
const $=id=>root.querySelector("#"+id);
const categories=["Projects","Resources","Archives","Hubs"];
const colors={Projects:[0,.95,1],Resources:[.78,.16,1],Archives:[.51,.59,.69],Hubs:[1,.85,.21]};
const hex={Projects:"#00ffff",Resources:"#bf00ff",Archives:"#8392a9",Hubs:"#ffd700"};
const canvas=$("scene"),plane=$("plane"),ctx=plane.getContext("2d",{alpha:true});
const skinVars={Projects:"--node-project",Resources:"--node-resource",Archives:"--node-archive",Hubs:"--node-hub"};
function syncNodeColors(){const st=getComputedStyle(root);for(const key of categories){const next=st.getPropertyValue(skinVars[key]).trim();if(/^#[a-fA-F0-9]{6}$/.test(next)){hex[key]=next;colors[key]=[1,3,5].map(p=>parseInt(next.slice(p,p+2),16)/255);}}}
root.addEventListener("visualizer-skin-change",syncNodeColors);
const mq=matchMedia("(prefers-reduced-motion: reduce)");
const state={all:[],allEdges:[],nodes:[],edges:[],byId:new Map(),view:"web",category:"all",focusProject:null,sort:"name",selected:null,hover:null,drag:null,hoverCoords:null,paused:false,webgl:null,webglError:false,projection:[],size:{w:1,h:1},camera:{yaw:.35,pitch:.17,distance:650,offsetX:0,offsetY:0},cameraGoal:null,pan:{x:0,y:0},zoom:1,time:0,last:performance.now(),sourceError:false,imported:0,graphReady:false,positions:new Map(),forceSteps:0,vertices:[],lastListId:""};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const seed=(s,k=0)=>((hash(String(s)+"#"+k)%100000)/100000);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=s=>{if(!s)return "Not reported";const d=new Date(s);return Number.isNaN(d.valueOf())?"Not reported":d.toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})};
const safeUrl=u=>{try{const x=new URL(u);return ["https:","http:"].includes(x.protocol)?x.href:null}catch{return null}};
const order=(a,b)=>state.sort==="weight"?(b.weight||0)-(a.weight||0)||a.label.localeCompare(b.label):state.sort==="date"?String(b.date||"").localeCompare(String(a.date||""))||a.label.localeCompare(b.label):a.label.localeCompare(b.label);
function parseGithub(feed){const nodes=[],edges=[];for(const p of feed.projects||[]){if(!p?.slug)continue;
 const id="project:"+p.slug;nodes.push({id,label:String(p.name||p.slug),group:"Projects",kind:"GitHub repository",date:p.updatedAt||null,weight:Math.max(1,(p.issues||0)+(p.prs||0)),url:safeUrl(p.url),description:p.description||"GitHub project",source:"Public GitHub",stale:!!p.stale||!p.accessible,tags:[],folder:p.slug});
 for(const w of p.items||[]){if(!w?.number||!w?.kind)continue;const wid=id+":"+w.kind+":"+w.number;nodes.push({id:wid,label:String(w.title||"Untitled work"),group:"Resources",kind:w.kind==="pr"?"Pull request":"Issue",date:w.updatedAt||null,weight:1,url:safeUrl(w.url),description:w.kind==="pr"?(w.draft?"Draft PR — not verified as delivered":"Open PR — not a deployed release"):"Open issue",source:"Public GitHub",stale:!!p.stale,tags:[],folder:p.slug});edges.push({source:id,target:wid,relationship:w.kind==="pr"?"Contains pull request":"Contains issue",inferred:false});}
 }return {nodes,edges};}
function preparePositions(){const ordered=state.all.slice().sort((a,b)=>a.id.localeCompare(b.id));const byGroup={Projects:[],Resources:[],Archives:[],Hubs:[]};for(const n of ordered)byGroup[n.group]?.push(n);
 const centers={Projects:[-145,58,-45],Resources:[145,10,8],Archives:[-80,-85,115],Hubs:[70,96,-145]};
 for(const g of categories){const arr=byGroup[g];arr.forEach((n,i)=>{const a=i*2.399963+seed(n.id,1)*.42;const r=40+Math.sqrt(i+1)*13;const o=centers[g];n.p3={x:o[0]+Math.cos(a)*r,y:o[1]+Math.sin(a)*r*.76,z:o[2]+(seed(n.id,2)-.5)*Math.max(45,r*1.5)};n.p2={x:Math.cos(a)*r+o[0],y:Math.sin(a)*r*.74+o[1]};});}
 const pro=byGroup.Projects;pro.forEach((n,i)=>{const theta=(i/Math.max(1,pro.length))*Math.PI*2-Math.PI/2;const radius=155;n.p2={x:Math.cos(theta)*radius,y:Math.sin(theta)*radius*.8};n.p3={x:Math.cos(theta)*195,y:Math.sin(theta)*140,z:(seed(n.id,2)-.5)*115};});state.forceSteps=0;}
function setGraph(nodes,edges){const seen=new Set();const filtered=[];for(const n of nodes){if(!n?.id||seen.has(n.id)||!categories.includes(n.group))continue;seen.add(n.id);filtered.push(n);}
 state.all=filtered;state.byId=new Map(filtered.map(n=>[n.id,n]));state.allEdges=edges.filter(e=>state.byId.has(e.source)&&state.byId.has(e.target)&&e.source!==e.target);
 preparePositions();updateFiltered();}
function updateFiltered(){
 const focus=state.focusProject;
 const visible=state.all.filter(n=>focus?(n.id===focus||n.folder===focus.slice(8)):n.group==="Projects"||n.id.startsWith("local:"));
 state.nodes=visible.filter(n=>state.category==="all"||n.group===state.category).sort(order);
 const focusNode=focus&&state.byId.get(focus);
 $("focus-chip").hidden=!focus;$("focus-name").textContent=focusNode?.label||"Project";
const included=new Set(state.nodes.map(n=>n.id));state.edges=state.allEdges.filter(e=>included.has(e.source)&&included.has(e.target));state.graphReady=true;
 $("node-count").textContent=state.nodes.length.toLocaleString();$("link-count").textContent=state.edges.length.toLocaleString();$("list-count").textContent=state.nodes.length.toLocaleString();
 if(state.selected&&!included.has(state.selected.id))closeInspector();renderList();if(state.nodes.length===0)message("No matching items. Change the filter or go back to projects.");else if(!state.sourceError)message("");}
function addImported(files){let errorCount=0,accepted=0;const incoming=[],edges=[];const tasks=[...files].slice(0,100).map(async file=>{if(file.size>10*1024*1024){errorCount++;return}try{const text=await file.text();if(!text.trim())throw Error("empty");let records=[];
 if(/\.json$/i.test(file.name)){const parsed=JSON.parse(text);records=Array.isArray(parsed)?parsed:(Array.isArray(parsed.nodes)?parsed.nodes:[parsed]);}
 else {const match=text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);const head=match?.[1]||"";const field=k=>head.match(new RegExp("^"+k+":\\s*(.*)$","mi"))?.[1]?.trim().replace(/^["']|["']$/g,"");records=[{name:field("title")||file.name.replace(/\.md$/i,""),date:field("date"),tags:field("tags")?.replace(/[\[\]]/g,"").split(",").map(x=>x.trim()).filter(Boolean)||[],content:(match?text.slice(match[0].length):text).slice(0,700)}];}
 for(let i=0;i<Math.min(records.length,1500);i++){const r=records[i];if(!r||typeof r!=="object")continue;const id="local:"+hash(file.name+":"+i+":"+text.length)+":"+i;const rawGroup=String(r.group||r.category||"").toLowerCase();const group=rawGroup.startsWith("project")?"Projects":rawGroup.startsWith("archive")?"Archives":rawGroup.startsWith("hub")?"Hubs":"Resources";
 incoming.push({id,label:String(r.name||r.title||file.name),group,kind:"Local document",date:r.date||r.created_time||null,weight:Math.max(1,Number(r.size)||Math.round(file.size/1024)),url:null,description:String(r.content||r.description||"").slice(0,700),source:"Imported on this device",stale:false,tags:Array.isArray(r.tags)?r.tags.map(String):[],folder:String(r.folder||file.name)});accepted++;
 }
 }catch{errorCount++;}});
 Promise.all(tasks).then(()=>{const prior=state.all.filter(n=>!n.id.startsWith("local:"));const retained=state.all.filter(n=>n.id.startsWith("local:"));const map=new Map([...prior,...retained,...incoming].map(n=>[n.id,n]));const all=[...map.values()];const old=state.allEdges.filter(e=>!e.inferred);
 // Bounded inferred associations: no quadratic all-to-all expansion.
 const buckets=new Map();for(const n of all.filter(x=>x.id.startsWith("local:"))){for(const k of [...n.tags.slice(0,5).map(tag=>"tag:"+tag.toLowerCase()),"folder:"+n.folder]){if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(n.id);}}
 for(const [tag,ids] of buckets){ids.sort();for(let i=1;i<ids.length;i++){if(i>3000)break;edges.push({source:ids[i-1],target:ids[i],relationship:"Shared "+tag,inferred:true});}}
 setGraph(all,[...old,...edges]);state.imported+=accepted;
 $("source-label").textContent=(state.sourceError?"Local imports":"Live public GitHub")+(state.imported?" + "+state.imported+" device-local items":"");
 message(accepted+" imported locally"+(errorCount?" · "+errorCount+" file(s) skipped":""));});}
function message(str,kind="info"){const el=$("status");el.textContent=str;el.hidden=!str;el.dataset.kind=kind;}
async function load(){message("Connecting to public GitHub data…");try{const res=await fetch("/api/hub",{cache:"no-store"});if(!res.ok)throw Error("HTTP "+res.status);const feed=await res.json();if(!Array.isArray(feed.projects))throw Error("Invalid data response");const data=parseGithub(feed);state.sourceError=!!feed.errors;
 const imported=state.all.filter(n=>n.id.startsWith("local:"));setGraph([...data.nodes,...imported],[...data.edges,...state.allEdges.filter(e=>e.inferred)]);
 const total=feed.projects.length,good=feed.projects.filter(p=>p.accessible&&!p.stale&&!p.limited).length;
 $("source-label").textContent="Public GitHub projects & work"+(state.imported?" + local imports":"");
 $("freshness").textContent=good===total?"Live public source":good+" / "+total+" sources available";
 $("freshness").style.color=good===total?"#64caaa":"#f4b86d";
 if(state.sourceError)message("Some GitHub sources are unavailable. Data may be incomplete.","warning");else if(!state.nodes.length)message("No available public GitHub data. Import Markdown or JSON to explore.");else message("");
 }catch(e){state.sourceError=true;$("freshness").textContent="GitHub unavailable";$("source-label").textContent="Device-local records only";setGraph(state.all.filter(n=>n.id.startsWith("local:")),state.allEdges.filter(e=>e.inferred));message("Public GitHub data could not load. You can still import files locally.","warning");}}
function theme(){root.dataset.theme=document.documentElement.dataset.theme||"blue";root.dataset.appearance=document.documentElement.dataset.appearance||"dark";syncNodeColors();}theme();onWindowEvent("storage",theme);
onWindowEvent("message",e=>{if(e.origin!==location.origin||!e.data||e.data.type!=="NBO_THEME")return;root.dataset.theme=e.data.palette;root.dataset.appearance=e.data.appearance;syncNodeColors();});
function showInspector(n){state.selected=n;const joined=state.allEdges.filter(e=>e.source===n.id||e.target===n.id).slice(0,30);const conn=joined.map(e=>{const related=state.byId.get(e.source===n.id?e.target:e.source);return related?`<span class="connection">${esc(related.label)}<small>${e.inferred?"Inferred association":"Confirmed"} · ${esc(e.relationship)}</small></span>`:""}).join("");
 $("inspector-main").innerHTML=`<span class="inspector-group" style="--dot:${hex[n.group]}"><i></i>${esc(n.group.toUpperCase())}</span><h2>${esc(n.label)}</h2><p>${esc(n.description||"No description supplied by source.")}</p><dl><div class="detail-row"><dt>Type</dt><dd>${esc(n.kind)}</dd></div><div class="detail-row"><dt>Source</dt><dd>${esc(n.source)}${n.stale?" · Incomplete / stale":""}</dd></div><div class="detail-row"><dt>Updated</dt><dd>${esc(fmt(n.date))}</dd></div><div class="detail-row"><dt>Weight</dt><dd>${n.weight===undefined?"Not reported":esc(n.weight)}</dd></div></dl><h3>Connections (${joined.length}${state.allEdges.filter(e=>e.source===n.id||e.target===n.id).length>30?"+":""})</h3>${conn||"<p>No verified or inferred connections.</p>"}${n.url?`<a class="source-btn" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">Open original ↗</a>`:""}${n.id.startsWith("project:")?`<button class="source-btn explore-btn" id="explore-project" type="button">Explore this project’s work →</button>`:""}`;
 const explore=$("explore-project");if(explore)explore.addEventListener("click",()=>{state.focusProject=n.id;state.category="all";$("category").value="all";updateFiltered();closeInspector();state.pan={x:0,y:0};state.zoom=1;});
 $("node-list").hidden=true;$("list-toggle").setAttribute("aria-expanded","false");
 $("inspector").classList.add("open");$("inspector").setAttribute("aria-hidden","false");$("panel-shade").hidden=false;$("search").setAttribute("aria-expanded","false");$("suggestions").hidden=true;}
function closeInspector(){state.selected=null;$("inspector").classList.remove("open");$("inspector").setAttribute("aria-hidden","true");$("panel-shade").hidden=true;}
function select(n,focus=true){if(!n)return;if(n.group!=="Projects"&&!state.nodes.some(x=>x.id===n.id)&&n.folder){const p=state.all.find(x=>x.group==="Projects"&&x.folder===n.folder);if(p){state.focusProject=p.id;state.category="all";$("category").value="all";updateFiltered();}}showInspector(n);if(focus&&state.view==="galaxy")state.cameraGoal={yaw:state.camera.yaw,pitch:state.camera.pitch,distance:clamp(state.camera.distance*.8,170,700),target:n.p3};
 if(focus&&state.view!=="galaxy"&&n.screen){state.pan.x+=state.size.w/2-n.screen.x;state.pan.y+=state.size.h/2-n.screen.y;}}
function renderList(){const q=$("search").value.toLowerCase().trim();const filtered=state.nodes.filter(n=>!q||n.label.toLowerCase().includes(q)).slice(0,200);$("list-content").replaceChildren();for(const n of filtered){const b=document.createElement("button");b.type="button";b.innerHTML=esc(n.label)+`<small>${esc(n.group)} · ${esc(n.kind)}</small>`;b.addEventListener("click",()=>{select(n);$("node-list").hidden=true;});$("list-content").appendChild(b);}if(!filtered.length)$("list-content").textContent="No items match. Clear search or change category.";}
function suggestions(){const q=$("search").value.trim().toLowerCase(),el=$("suggestions");el.replaceChildren();if(!q){el.hidden=true;$("search").setAttribute("aria-expanded","false");return}for(const n of state.all.filter(x=>x.label.toLowerCase().includes(q)).slice(0,7)){const b=document.createElement("button");b.type="button";b.setAttribute("role","option");b.innerHTML=esc(n.label)+`<small>${esc(n.group)} · ${esc(n.kind)}</small>`;b.addEventListener("click",()=>{select(n);el.hidden=true;$("search").value=n.label;renderList();});el.appendChild(b);}el.hidden=!el.childElementCount;$("search").setAttribute("aria-expanded",String(!el.hidden));renderList();}
$("search").addEventListener("input",suggestions);$("search").addEventListener("keydown",e=>{if(e.key==="Escape"){$("suggestions").hidden=true;return}if(e.key==="Enter"){e.preventDefault();const n=state.all.find(x=>x.label.toLowerCase().includes($("search").value.toLowerCase()));if(n)select(n);$("suggestions").hidden=true;}});
$("focus-chip").addEventListener("click",()=>{state.focusProject=null;state.category="all";$("category").value="all";state.pan={x:0,y:0};state.zoom=1;updateFiltered();closeInspector();});
$("category").addEventListener("change",e=>{state.category=e.target.value;updateFiltered();});$("sort").addEventListener("change",e=>{state.sort=e.target.value;updateFiltered();});
root.querySelector(".import-btn").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();$("import").click();}});
$("import").addEventListener("change",e=>{if(e.target.files?.length)addImported(e.target.files);e.target.value="";});
$("pause").addEventListener("click",()=>{state.paused=!state.paused;$("pause").setAttribute("aria-pressed",String(state.paused));$("pause").setAttribute("aria-label",state.paused?"Resume motion":"Pause motion");$("pause-icon").setAttribute("d",state.paused?"M7 4v16l13-8z":"M8 5v14M16 5v14");});
$("fit").addEventListener("click",()=>{state.pan={x:0,y:0};state.zoom=1;state.camera.distance=650;state.camera.offsetX=0;state.camera.offsetY=0;state.cameraGoal=null;});
$("reset").addEventListener("click",()=>{state.pan={x:0,y:0};state.zoom=1;state.camera={yaw:.35,pitch:.17,distance:650,offsetX:0,offsetY:0};state.cameraGoal=null;});
$("close-inspector").addEventListener("click",closeInspector);$("panel-shade").addEventListener("click",closeInspector);
$("list-toggle").addEventListener("click",()=>{closeInspector();const open=$("node-list").hidden;$("node-list").hidden=!open;$("list-toggle").setAttribute("aria-expanded",String(open));renderList();});$("list-close").addEventListener("click",()=>{$("node-list").hidden=true;$("list-toggle").setAttribute("aria-expanded","false");});
onWindowEvent("keydown",e=>{if(e.key==="Escape"){closeInspector();$("node-list").hidden=true;$("suggestions").hidden=true;}});
function view(v){state.view=v;for(const b of root.querySelectorAll("[data-view]")){const active=b.dataset.view===v;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));}
 state.pan={x:0,y:0};state.zoom=1;state.cameraGoal=null;$("compass").style.display=v==="galaxy"?"":"none";
 if(v==="galaxy"&&(!state.webgl||state.webglError)){message("3D unavailable here. Galaxy uses the interactive map.","warning");return}
 if(!state.sourceError&&state.nodes.length)message("");}
root.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>view(b.dataset.view)));
function resize(){const r=canvas.getBoundingClientRect();state.size={w:Math.max(1,r.width),h:Math.max(1,r.height)};if(!state.drag&&!state.selected&&state.pan.x===0&&state.pan.y===0&&state.zoom===1&&r.width<780)state.zoom=clamp(r.width/800,.4,1);const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);plane.width=Math.round(r.width*dpr);plane.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(state.webgl)state.webgl.viewport(0,0,canvas.width,canvas.height);}
onWindowEvent("resize",resize);resize();
function shader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function program(gl,v,f){const p=gl.createProgram();gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,v));gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
function initGl(){try{const gl=canvas.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)throw Error("WebGL unavailable");state.webgl=gl;
 const vertex=`attribute vec3 p;attribute vec3 color;attribute float diameter;uniform vec2 resolution;uniform float zoom;uniform vec2 orbit;uniform float uDistance;uniform vec2 offset;varying vec3 vColor;varying float vDepth;void main(){float cy=cos(orbit.x),sy=sin(orbit.x),cp=cos(orbit.y),sp=sin(orbit.y);vec3 a=vec3(p.x*cy-p.z*sy,p.y,p.x*sy+p.z*cy);vec3 b=vec3(a.x,a.y*cp-a.z*sp,a.y*sp+a.z*cp);float depth=max(90.,uDistance-b.z);float focal=min(resolution.x,resolution.y)*1.15;gl_Position=vec4((b.xy+offset)*vec2(focal/depth)/resolution*2.,(depth-650.)/2500.,1.);gl_PointSize=diameter*focal/depth*zoom;vColor=color;vDepth=clamp(depth/1200.,0.,1.);}`;
 const pointFrag=`precision mediump float;varying vec3 vColor;varying float vDepth;void main(){vec2 uv=gl_PointCoord*2.-1.;float r=length(uv);if(r>1.)discard;float core=1.-smoothstep(.15,.78,r);float corona=(1.-smoothstep(.36,1.,r))*.32;float highlight=max(0.,1.-length(uv+vec2(.29,.31))*1.8)*.75;vec3 shade=mix(vColor*.22,vColor*.95,core);shade=mix(shade,vec3(1.),highlight);gl_FragColor=vec4(shade+vColor*corona,(core*.94+corona*.68)*(1.-vDepth*.42));}`;
 const lineFrag=`precision mediump float;varying vec3 vColor;varying float vDepth;void main(){gl_FragColor=vec4(vColor,(1.-vDepth*.5)*.23);}`;
 state.pointProgram=program(gl,vertex,pointFrag);state.lineProgram=program(gl,vertex,lineFrag);state.buffer=gl.createBuffer();gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);return true;
 }catch(e){console.warn("NBO WebGL initialization:",e);state.webglError=true;return false;}}
initGl();resize(); if(state.webglError)message("3D graphics unavailable. Showing interactive 2D Galaxy mode.","warning");
function project(n){const {yaw,pitch,distance,offsetX,offsetY}=state.camera;const p=n.p3;const c=Math.cos(yaw),s=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);const x=p.x*c-p.z*s;const z=p.x*s+p.z*c;const y=p.y*cp-z*sp;const zz=p.y*sp+z*cp;const depth=Math.max(90,distance-zz);const focal=Math.min(state.size.w,state.size.h)*1.15;
 return {x:state.size.w/2+(x+offsetX)*focal/depth,y:state.size.h/2-(y+offsetY)*focal/depth,z:depth,r:clamp((12+Math.min(14,Math.sqrt(n.weight||1)*2))*focal/depth,3,24)};}
function bufferDraw(gl,prog,items,mode){gl.useProgram(prog);gl.bindBuffer(gl.ARRAY_BUFFER,state.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(items),gl.DYNAMIC_DRAW);const stride=28;for(const [name,len,offset] of [["p",3,0],["color",3,12],["diameter",1,24]]){const a=gl.getAttribLocation(prog,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,len,gl.FLOAT,false,stride,offset)}
 gl.uniform2f(gl.getUniformLocation(prog,"resolution"),state.size.w,state.size.h);gl.uniform1f(gl.getUniformLocation(prog,"zoom"),1);gl.uniform2f(gl.getUniformLocation(prog,"orbit"),state.camera.yaw,state.camera.pitch);gl.uniform1f(gl.getUniformLocation(prog,"uDistance"),state.camera.distance);gl.uniform2f(gl.getUniformLocation(prog,"offset"),state.camera.offsetX,state.camera.offsetY);
 gl.drawArrays(mode,0,items.length/7);}
function renderGalaxy(dt){const gl=state.webgl;if(!gl)return;
 gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);state.projection=[];
 const neighbors=new Set();if(state.hover){neighbors.add(state.hover.id);for(const e of state.edges){if(e.source===state.hover.id)neighbors.add(e.target);if(e.target===state.hover.id)neighbors.add(e.source)}}
 if(!state.paused&&!mq.matches&&!document.hidden&&!state.drag&&!state.cameraGoal)state.camera.yaw+=dt*.000005;
 if(state.cameraGoal){const g=state.cameraGoal;state.camera.distance+=(g.distance-state.camera.distance)*.08;state.camera.offsetX+=(-g.target.x-state.camera.offsetX)*.08;state.camera.offsetY+=(-g.target.y-state.camera.offsetY)*.08;if(Math.abs(state.camera.distance-g.distance)<1&&Math.abs(state.camera.offsetX+g.target.x)<2)state.cameraGoal=null;}
 const lines=[],dots=[];for(const e of state.edges){const a=state.byId.get(e.source),b=state.byId.get(e.target);if(!a||!b)continue;const color=colors[a.group],active=!state.hover||neighbors.has(a.id)&&neighbors.has(b.id);for(const n of [a,b])lines.push(n.p3.x,n.p3.y,n.p3.z,...color.map(x=>x*(active?.52:.07)),1)}
 for(const n of state.nodes){const c=colors[n.group];const hovered=n===state.hover||n===state.selected;const muted=state.hover&&!neighbors.has(n.id);const bright=hovered?1.4:muted?.18:.95;dots.push(n.p3.x,n.p3.y,n.p3.z,...c.map(x=>Math.min(1,x*bright)),hovered?39:16+Math.min(12,Math.sqrt(n.weight||1)*2));n.screen=project(n);state.projection.push(n);}
 gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);bufferDraw(gl,state.lineProgram,lines,gl.LINES);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);bufferDraw(gl,state.pointProgram,dots,gl.POINTS);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
}
function screenPos(p){return {x:state.size.w/2+state.pan.x+p.x*state.zoom,y:state.size.h/2+state.pan.y-p.y*state.zoom};}
function computeGrid(){const w=state.size.w,h=state.size.h;const midx=w/2,midy=h/2;
 const small=w<600,top=small?Math.max(150,h*.24):Math.max(150,h*.22),bottom=h-105;
 const cells=categories.map((_,i)=>{if(small){const dy=(bottom-top)/4;return{x:14,y:top+i*dy,w:w-28,h:dy-9}}const col=i%2,row=Math.floor(i/2),gap=12,mx=Math.max(22,w*.045),mid=w/2,dy=(bottom-top)/2;return{x:col?mid+gap/2:mx,y:top+row*dy,w:col?w-mx-mid-gap/2:mid-mx-gap/2,h:dy-gap}});
 return {cells};}
function render2D(dt){const {w,h}=state.size;ctx.clearRect(0,0,w,h);/* Render the usable 2D Galaxy when WebGL is unavailable. */
 const light=root.dataset.appearance==="light",glow=light?.16:.48;const connections=new Set();if(state.hover){connections.add(state.hover.id);for(const e of state.edges){if(e.source===state.hover.id)connections.add(e.target);if(e.target===state.hover.id)connections.add(e.source)}}
 const grid=computeGrid();if(state.view==="grid"){categories.forEach((g,i)=>{const box=grid.cells[i],x=box.x,y=box.y,width=box.w,height=box.h;ctx.fillStyle=light?"rgba(255,255,255,.68)":"rgba(11,20,41,.58)";ctx.strokeStyle=light?"rgba(44,86,147,.2)":"rgba(151,182,230,.16)";roundRect(ctx,x,y,width,height,18);ctx.fill();ctx.stroke();ctx.fillStyle=hex[g];ctx.font="700 13px Inter, sans-serif";ctx.fillText(g.toUpperCase(),x+19,y+26);const count=state.nodes.filter(n=>n.group===g).length;ctx.fillStyle=light?"#54677f":"#8196b6";ctx.font="11px Inter, sans-serif";ctx.fillText(count+" items",x+19,y+44)});}
 else if(state.view==="god"){const xs=state.nodes.map(n=>n.date&&new Date(n.date).valueOf()).filter(x=>Number.isFinite(x)&&x>0);const min=xs.length?Math.min(...xs):Date.now(),max=xs.length?Math.max(...xs):Date.now();const baseline=h-180,top=Math.max(200,h*.3);
 ctx.strokeStyle=light?"#b6c5dc":"rgba(132,156,203,.2)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(42,top);ctx.lineTo(42,baseline);ctx.lineTo(w-40,baseline);ctx.stroke();ctx.fillStyle=light?"#41536b":"#99aeca";ctx.font="11px Inter";ctx.fillText("LINK COUNT ↑",45,top-17);ctx.fillText("DATE →",Math.max(50,w-95),baseline+22);ctx.fillText(fmt(min),50,baseline+22);ctx.fillText(fmt(max),Math.max(80,w-175),baseline+22);if(state.nodes.some(n=>!n.date||!Number.isFinite(new Date(n.date).valueOf())))ctx.fillText("UNDATED",w-103,top-17);
 state.timeline={min,max,top,baseline};}
 if(state.view==="web"||(state.view==="galaxy"&&!state.webgl))force(dt);
 for(const n of state.nodes){let pos;if(state.view==="web"||(state.view==="galaxy"&&!state.webgl)){pos=screenPos(n.p2)}else if(state.view==="grid"){
 const i=categories.indexOf(n.group),box=grid.cells[i],x=box.x,y=box.y;const width=box.w-24,height=box.h-64;const sorted=state.nodes.filter(a=>a.group===n.group),rank=sorted.indexOf(n);const count=Math.min(sorted.length,120),cols=Math.max(1,Math.ceil(Math.sqrt(count*width/Math.max(height,1))));const cell=width/cols;const rows=Math.max(1,Math.ceil(count/cols));pos={x:x+16+(rank%cols+.5)*cell,y:y+59+(Math.floor(rank/cols)+.5)*(height/rows)};}
 else{const t=state.timeline,ms=n.date&&new Date(n.date).valueOf(),dated=Number.isFinite(ms)&&ms>0;const x=dated?75+(w-155)*(ms-t.min)/(Math.max(1,t.max-t.min)):w-55;const degree=state.allEdges.filter(e=>e.source===n.id||e.target===n.id).length;const height=(t.baseline-t.top)*clamp(Math.log2(2+degree)/7,.05,.95);pos={x:x+(seed(n.id)-.5)*14,y:t.baseline-height};}
 const r=state.view==="grid"?5:n.group==="Projects"?clamp(13+Math.log2(n.weight+2)*1.3,14,22):clamp(3.6+Math.sqrt(n.weight||1)*1.35,4,16);n.screen={...pos,r};}
 ctx.save();ctx.lineWidth=.75;for(const e of state.edges){if(state.view==="grid")break;const a=state.byId.get(e.source),b=state.byId.get(e.target);if(!a?.screen||!b?.screen)continue;ctx.strokeStyle=state.hover&&(!connections.has(a.id)||!connections.has(b.id))?"rgba(115,129,162,.04)":e.inferred?(light?"rgba(84,105,170,.13)":"rgba(134,142,209,.15)"):(light?"rgba(44,115,182,.15)":"rgba(79,190,236,.22)");ctx.setLineDash(e.inferred?[3,5]:[]);ctx.beginPath();ctx.moveTo(a.screen.x,a.screen.y);ctx.lineTo(b.screen.x,b.screen.y);ctx.stroke();}ctx.restore();
 for(const n of state.nodes){const {x,y,r}=n.screen;if(x<-30||x>w+30||y<-30||y>h+30)continue;const muted=state.hover&&!connections.has(n.id);const rr=state.selected===n||state.hover===n?r+5:r;ctx.save();ctx.globalAlpha=muted?.14:1;
 const gd=ctx.createRadialGradient(x,y,0,x,y,rr*2.45);gd.addColorStop(0,hex[n.group]+"aa");gd.addColorStop(.25,hex[n.group]+"35");gd.addColorStop(1,hex[n.group]+"00");ctx.fillStyle=gd;ctx.beginPath();ctx.arc(x,y,rr*2.45,0,Math.PI*2);ctx.fill();ctx.fillStyle=light?"rgba(255,255,255,.92)":"rgba(17,24,39,.92)";ctx.beginPath();ctx.arc(x,y,rr,0,Math.PI*2);ctx.fill();ctx.strokeStyle=hex[n.group];ctx.lineWidth=n.group==="Projects"?2.6:1.4;ctx.stroke();ctx.fillStyle=hex[n.group];ctx.beginPath();ctx.arc(x,y,Math.max(3,rr*.27),0,Math.PI*2);ctx.fill();
 if(n.group==="Projects"||state.hover===n||state.selected===n){const label=n.label.length>27?n.label.slice(0,26)+"…":n.label;ctx.font="600 12px Inter, sans-serif";ctx.textAlign="center";const lw=ctx.measureText(label).width;const yy=y+rr+18;ctx.fillStyle=light?"rgba(255,255,255,.94)":"rgba(13,18,28,.9)";roundRect(ctx,x-lw/2-9,yy-13,lw+18,23,7);ctx.fill();ctx.fillStyle=light?"#1b2637":"#e9eefc";ctx.fillText(label,x,yy+2);}
 ctx.restore();}
}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
function force(dt){if(state.forceSteps>=120||state.paused||mq.matches)return;state.forceSteps++;
 const nodes=state.nodes;if(nodes.length>450)return;const target=state.edges;const velocities=new Map(nodes.map(n=>[n.id,{x:0,y:0}]));
 // Fixed-rate deterministic relaxation; bounded pair work on large graphs.
 for(let i=0;i<nodes.length;i++){const a=nodes[i],va=velocities.get(a.id);va.x-=a.p2.x*.00008;va.y-=a.p2.y*.00008;
 for(let j=i+1;j<nodes.length;j++){const b=nodes[j],vb=velocities.get(b.id),dx=a.p2.x-b.p2.x,dy=a.p2.y-b.p2.y,d2=dx*dx+dy*dy+12;const power=Math.min(.8,500/d2);va.x+=dx*power/Math.sqrt(d2);va.y+=dy*power/Math.sqrt(d2);vb.x-=dx*power/Math.sqrt(d2);vb.y-=dy*power/Math.sqrt(d2);}}
 for(const e of target){const a=state.byId.get(e.source),b=state.byId.get(e.target);if(!a||!b)continue;const dx=b.p2.x-a.p2.x,dy=b.p2.y-a.p2.y,d=Math.max(1,Math.hypot(dx,dy));const f=(d-85)*.0015;const av=velocities.get(a.id),bv=velocities.get(b.id);if(av){av.x+=dx/d*f;av.y+=dy/d*f}if(bv){bv.x-=dx/d*f;bv.y-=dy/d*f}}
 for(const n of nodes){if(state.drag?.node===n)continue;const v=velocities.get(n.id);n.p2.x+=clamp(v.x,-3,3);n.p2.y+=clamp(v.y,-3,3);}}
function hit(x,y){let best=null,distance=Infinity;for(const n of state.nodes){if(!n.screen)continue;const d=Math.hypot(x-n.screen.x,y-n.screen.y),r=Math.max(14,n.screen.r+6);if(d<r&&d<distance){best=n;distance=d}}return best;}
function hoverAt(e){if(state.drag)return;const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const hitNode=hit(x,y);state.hover=hitNode;canvas.style.cursor=hitNode?"pointer":"grab";const tip=$("hover-label");tip.hidden=!hitNode;if(hitNode){tip.textContent=hitNode.label;tip.style.left=clamp(x+17,6,state.size.w-250)+"px";tip.style.top=clamp(y-32,6,state.size.h-50)+"px";}}
canvas.addEventListener("pointermove",e=>{if(!state.drag){hoverAt(e);return}const dx=e.clientX-state.drag.x,dy=e.clientY-state.drag.y;state.drag.x=e.clientX;state.drag.y=e.clientY;state.drag.distance+=Math.abs(dx)+Math.abs(dy);
 if(state.drag.node&&state.view==="web"){state.drag.node.p2.x+=dx/state.zoom;state.drag.node.p2.y-=dy/state.zoom;state.forceSteps=0;}
 else if(state.view==="galaxy"&&state.webgl){state.camera.yaw+=dx*.006;state.camera.pitch=clamp(state.camera.pitch+dy*.006,-1.3,1.3);state.cameraGoal=null;}
 else {state.pan.x+=dx;state.pan.y+=dy;}});
canvas.addEventListener("pointerdown",e=>{if(e.button!==0)return;canvas.setPointerCapture(e.pointerId);const r=canvas.getBoundingClientRect();state.drag={x:e.clientX,y:e.clientY,distance:0,node:state.view==="web"?hit(e.clientX-r.left,e.clientY-r.top):null};});
canvas.addEventListener("pointerup",e=>{if(!state.drag)return;const moved=state.drag.distance;state.drag=null;if(moved<9){const r=canvas.getBoundingClientRect();const n=hit(e.clientX-r.left,e.clientY-r.top);if(n)select(n,false);}});
canvas.addEventListener("pointercancel",()=>state.drag=null);canvas.addEventListener("pointerleave",()=>{if(!state.drag){state.hover=null;$("hover-label").hidden=true;}});
canvas.addEventListener("wheel",e=>{e.preventDefault();if(state.view==="galaxy"&&state.webgl)state.camera.distance=clamp(state.camera.distance*Math.exp(e.deltaY*.001),170,2400);else state.zoom=clamp(state.zoom*Math.exp(-e.deltaY*.001),.35,4);},{passive:false});
function frame(now){if(disposed)return;frameId=requestAnimationFrame(frame);if(document.hidden)return;const visible3D=state.view==="galaxy"&&!!state.webgl;if(!visible3D&&now-(state.lastDraw||0)<42)return;state.lastDraw=now;const dt=clamp(now-state.last,0,45);state.last=now;
 canvas.style.opacity=visible3D?"1":"0";plane.style.opacity=visible3D?"0":"1";
 if(visible3D)renderGalaxy(dt);else render2D(dt);
}frameId=requestAnimationFrame(frame);load();
return ()=>{disposed=true;cancelAnimationFrame(frameId);windowCleanup.forEach(fn=>fn());if(state.webgl){const gl=state.webgl;for(const key of ["buffer"]){if(state[key])gl.deleteBuffer(state[key]);}for(const key of ["lineProgram","pointProgram"]){if(state[key])gl.deleteProgram(state[key]);}gl.getExtension("WEBGL_lose_context")?.loseContext();}};
};
})();
