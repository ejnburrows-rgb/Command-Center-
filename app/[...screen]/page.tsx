import {notFound} from "next/navigation";
import NBOPage from "../nbo-page";
import {READ_REPOS} from "@/lib/repos";
export default async function Screen({params}:{params:Promise<{screen:string[]}>}){
const {screen:s}=await params;
const top=["projects","github","ai-operations","evidence","knowledge","best-practices","prompts","tools","assets","settings"];
if(!top.includes(s[0]))notFound();
if(s[0]==="projects"){
 if(s.length>3||(s[1]&&!READ_REPOS.some(r=>r.repo===s[1]))||(s[2]&&!["work","jobs","live","resources"].includes(s[2])))notFound();
}else if(s[0]==="best-practices"){
 if(s.length>2||(s[1]&&!["before","during","after"].includes(s[1])))notFound();
}else if(s.length>1)notFound();
return <NBOPage/>;
}
