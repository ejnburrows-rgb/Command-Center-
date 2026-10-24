export type Work={number:number;title:string;url:string;updatedAt:string;kind:string;labels:string[];draft?:boolean};
export type Project={slug:string;name:string;url:string;description:string;visibility:string;language:string;updatedAt:string;issues:number|null;prs:number|null;drafts:number|null;fetchedAt:string;stale:boolean;error?:string;items:Work[];accessible:boolean;limited:boolean};
export type Feed={updatedAt:string;projects:Project[];errors:number};
export type Section="Hub"|"Projects"|"GitHub"|"AI Operations"|"Knowledge"|"Evidence"|"Best Practices"|"Prompts"|"Tools"|"Assets"|"Settings"|"Visualizer";
export const sections:Section[]=["Hub","Projects","GitHub","AI Operations","Evidence","Knowledge","Best Practices","Prompts","Tools","Assets","Settings","Visualizer"];
export const prompts=[
{name:"Project kickoff",cat:"Planning",desc:"Define scope, risk and the visible result.",text:"Inspect existing files, current behavior and instructions. Define the exact outcome, boundaries, risks and acceptance checks. Reuse working code. Choose one simplest plan and ask only for genuinely missing decisions."},
{name:"Execute the work",cat:"Development",desc:"Complete the smallest reliable change.",text:"Read the current source and project instructions. Fix the root cause or implement one bounded improvement. Preserve other features. Verify the original request and key regressions. Provide evidence and actual remaining blockers."},
{name:"Quality verification",cat:"Quality",desc:"Check proof before claiming completion.",text:"Check the exact current commit and live application. Verify acceptance criteria, navigation and important surrounding behavior. Separate draft, merged, deployed and functional states. Include actual evidence links and remaining gaps."},
{name:"Research and decide",cat:"Planning",desc:"Choose one option using current evidence.",text:"Verify primary-source facts, including costs, security and architecture. Independently check consequential claims. Recommend one best option, its tradeoff and the fact that would change the decision."},
{name:"Root-cause debugging",cat:"Development",desc:"Repair the actual problem.",text:"Reproduce the problem. Inspect code and relevant errors. Find root cause. Make the smallest safe fix, then verify the original issue and important related behavior. Present proof."},
{name:"Completion handoff",cat:"Quality",desc:"Deliver working results and proof.",text:"Report STATUS / RESULT / PROOF / WHAT REMAINS. Include the real URL, tested behavior and current commit. Never claim unverified work done."}
];
export const stages=[
{name:"Before a project",key:"before",steps:["Inspect current files and instructions","Define the exact outcome","Set boundaries and acceptance criteria","Choose the smallest practical approach","Confirm required permissions and costs"],prompt:0},
{name:"During a project",key:"during",steps:["Verify current behavior before edits","Complete one working unit at a time","Preserve unrelated working behavior","Test original requirement and regressions","Record actual evidence and blockers"],prompt:1},
{name:"After a project",key:"after",steps:["Test running result on phone and desktop","Verify important navigation and actions","Confirm privacy and permission boundaries","Keep source of truth and evidence current","Provide the working link and limitations"],prompt:5}
];
export const tools=[
{name:"GitHub",url:"https://github.com/ejnburrows-rgb",desc:"Source, issues and pull requests",cat:"Engineering"},
{name:"NBO public website",url:"https://nbo-website.vercel.app",desc:"Company website, separate from this hub",cat:"Business"},
{name:"Vercel",url:"https://vercel.com/dashboard",desc:"Current deployment management",cat:"Engineering"},
{name:"Google Drive",url:"https://drive.google.com",desc:"Documents and files",cat:"Workspace"},
{name:"Google Calendar",url:"https://calendar.google.com",desc:"Scheduling",cat:"Workspace"},
{name:"ChatGPT",url:"https://chatgpt.com",desc:"Research and development",cat:"AI"},
{name:"Figma",url:"https://www.figma.com/files",desc:"Visual design",cat:"Design"},
{name:"MDN",url:"https://developer.mozilla.org",desc:"Web development reference",cat:"Reference"}
];
export const assets=[
{name:"Gretel source",url:"https://github.com/ejnburrows-rgb/cartilla-de-gretel",cat:"Source"},
{name:"Art evidence PR",url:"https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/751",cat:"Artwork"},
{name:"Audio integration draft",url:"https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/769",cat:"Audio"},
{name:"NBO brand source",url:"https://github.com/ejnburrows-rgb/client-project-starter",cat:"Brand"},
{name:"Cartilla project issues",url:"https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues",cat:"Work"},
{name:"NBO public website",url:"https://nbo-website.vercel.app",cat:"Brand"}
];
