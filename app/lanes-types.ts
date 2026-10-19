export type LaneStatus="Draft"|"Open"|"Merged"|"Blocked";
export type Lane={id:string;name:string;status:LaneStatus;summary:string;updatedAt:string;sourceUrl:string;prUrl?:string;sourceType:"pull request"|"branch"|"issue";verified:boolean;branch?:string};
export type OwnerItem={id:string;title:string;reason:string;url:string;updatedAt:string;verified:boolean};
export type LanesFeed={lanes:Lane[];approvals:OwnerItem[];checkedAt:string;partial:boolean;errors:string[]};
