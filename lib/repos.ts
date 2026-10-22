export type RepoRef={owner:string;repo:string;label:string};
const owner="ejnburrows-rgb";
// MAIN WINDOW = ONLY these two projects (owner decision 2026-10-22:
// "Remove OTTO and all other crap! Leave only Lany Books and La Cartilla").
// Removed from the main window, NOT deleted; restore by re-adding a line:
//   otto (OTTO CRM), otto-plumbing-site (OTTO Plumbing Website),
//   tucker-pool-crm (Tucker Pool CRM), client-project-starter (NBO Website),
//   dbarrera-y-mas (D. Barrera y Más)
export const READ_REPOS:RepoRef[]=[
 {owner,repo:"lany-books-web",label:"Lany Books"},
 {owner,repo:"cartilla-de-gretel",label:"La Cartilla de Gretel"}
];
export const CONTENT_REPO:RepoRef={owner,repo:"Command-Center-",label:"NBO Command Center"};
export const CONTENT_BRANCH="main";
