export type StudioHistoryEntry = {role:"user"|"assistant"; content:string};
export declare function trimHistoryForRequest(
  text:string,
  recipients:readonly string[],
  history:readonly StudioHistoryEntry[],
  maxBytes?:number
):StudioHistoryEntry[];
