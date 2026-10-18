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
