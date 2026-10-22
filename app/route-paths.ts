import type {Section} from "./hub-data";
export const sectionPaths:Record<Section,string>={Hub:"/",Projects:"/projects",GitHub:"/github","Best Practices":"/best-practices",Prompts:"/prompts",Tools:"/tools",Assets:"/assets",Settings:"/settings"};
export const projectPath=(slug:string,view="")=>"/projects/"+encodeURIComponent(slug)+(view?"/"+view:"");
