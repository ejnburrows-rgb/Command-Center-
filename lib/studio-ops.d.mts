export type PublicProject = {slug?:string;name?:string;url?:string;issues?:number|null;prs?:number|null;fetchedAt?:string;stale?:boolean;accessible?:boolean;items?:Array<{kind?:string;number?:number;title?:string;url?:string}>};
export declare function summarizeOps(query:string,projects:PublicProject[]):string;
