export type LocalDoc={id:string;name:string;size:number;date:string;file:File};

function db():Promise<IDBDatabase>{return new Promise((ok,fail)=>{const r=indexedDB.open("nbo-files-v1",1);r.onupgradeneeded=()=>r.result.createObjectStore("docs",{keyPath:"id"});r.onsuccess=()=>ok(r.result);r.onerror=()=>fail(r.error)})}
async function run(mode:IDBTransactionMode,fn:(s:IDBObjectStore)=>IDBRequest):Promise<any>{const d=await db();return new Promise((ok,fail)=>{const t=d.transaction("docs",mode);const q=fn(t.objectStore("docs"));q.onsuccess=()=>ok(q.result);q.onerror=()=>fail(q.error);t.oncomplete=()=>d.close();t.onerror=()=>fail(t.error)})}
