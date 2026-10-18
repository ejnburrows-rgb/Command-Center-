import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const owner="ejnburrows-rgb",repo="Command-Center-";
function auth(){return process.env.GITHUB_TOKEN_WRITE||""}
const headers=()=>({Accept:"application/vnd.github+json",Authorization:"Bearer "+auth(),"X-GitHub-Api-Version":"2022-11-28"});
export async function GET(){
 if(!auth())return NextResponse.json({configured:false,files:[],message:"GitHub write access is not configured"},{headers:{"Cache-Control":"no-store"}});
 const r=await fetch("https://api.github.com/repos/"+owner+"/"+repo+"/contents/content/uploads",{headers:headers(),cache:"no-store"});
 if(r.status===404)return NextResponse.json({configured:true,files:[]});
 if(!r.ok)return NextResponse.json({configured:true,files:[],error:"GitHub request failed ("+r.status+")"},{status:502});
 const a=await r.json();
 return NextResponse.json({configured:true,files:(Array.isArray(a)?a:[]).filter(f=>f.type==="file").map(f=>({name:f.name,url:f.html_url,size:f.size,path:f.path}))},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(req:Request){
 if(!auth())return NextResponse.json({error:"Permanent GitHub file storage is not configured yet."},{status:503});
 const origin=req.headers.get("origin"),host=req.headers.get("host");
 if(origin&&new URL(origin).host!==host)return NextResponse.json({error:"Cross-site upload blocked"},{status:403});
 let data:FormData;
 try{data=await req.formData()}catch{return NextResponse.json({error:"Invalid form"},{status:400})}
 const file=data.get("file");
 if(!(file instanceof File))return NextResponse.json({error:"Choose a file"},{status:400});
 if(file.size<1||file.size>1000000)return NextResponse.json({error:"File must be 1 MB or smaller"},{status:413});
 const name=file.name.split(/[\\/]/).pop()||"file";
 const safe=name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,90);
 if(!/\.(md|txt|json|csv|png|jpg|jpeg|webp|pdf)$/i.test(safe))return NextResponse.json({error:"This file type is not supported"},{status:415});
 const path="content/uploads/"+new Date().toISOString().slice(0,10)+"-"+crypto.randomUUID().slice(0,12)+"-"+safe;
 const bytes=Buffer.from(await file.arrayBuffer());
 const body={message:"docs: save NBO hub resource "+safe,content:bytes.toString("base64"),branch:"main"};
 const r=await fetch("https://api.github.com/repos/"+owner+"/"+repo+"/contents/"+path,{method:"PUT",headers:{...headers(),"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
 if(!r.ok)return NextResponse.json({error:"GitHub rejected the save ("+r.status+"). File was not saved."},{status:502});
 const result=await r.json();
 return NextResponse.json({saved:true,url:result.content?.html_url||"",commit:result.commit?.sha||"",name:safe,path});
}