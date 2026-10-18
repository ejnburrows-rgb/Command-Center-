import {listDocs,saveDoc} from "./local-docs";
const keys=["nbo-checks","nbo-custom-prompts","nbo-theme","nbo-auto"];
function dataUrl(file:File):Promise<string>{return new Promise((ok,fail)=>{const r=new FileReader();r.onload=()=>ok(String(r.result));r.onerror=()=>fail(r.error);r.readAsDataURL(file)})}
export async function exportBackup(){
 const docs=await listDocs();
 const documents=await Promise.all(docs.map(async d=>({name:d.name,type:d.file.type,data:await dataUrl(d.file)})));
 const preferences=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
 const content=JSON.stringify({format:"nbo-hub-backup-v1",created:new Date().toISOString(),documents,preferences});
 const url=URL.createObjectURL(new Blob([content],{type:"application/json"}));
 const a=document.createElement("a");a.href=url;a.download="nbo-complete-backup.json";a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 return documents.length;
}

export async function restoreBackup(file:File){
 const json=JSON.parse(await file.text());
 if(json.format!=="nbo-hub-backup-v1"||!Array.isArray(json.documents))throw Error("Invalid NBO backup");
 if(!confirm("Restore this backup and replace saved preferences?"))return -1;
 for(const d of json.documents){
  if(typeof d.name!=="string"||typeof d.data!=="string"||!d.data.startsWith("data:"))continue;
  const blob=await (await fetch(d.data)).blob();
  if(blob.size<=10000000)await saveDoc(new File([blob],d.name,{type:blob.type}));
 }
 for(const k of keys){const v=json.preferences?.[k];if(typeof v==="string")localStorage.setItem(k,v)}
 return json.documents.length;
}
