export type RepoRef={owner:string;repo:string;label:string};
const owner="ejnburrows-rgb";
// Deliberately PUBLIC repositories only. This hub has no sign-in.
export const READ_REPOS:RepoRef[]=[
 {owner,repo:"cartilla-de-gretel",label:"La Cartilla de Gretel"},
 {owner,repo:"lany-books-web",label:"LANY Books"},
 {owner,repo:"Command-Center-",label:"NBO Operations Hub"},
 {owner,repo:"otto",label:"OTTO CRM"},
 {owner,repo:"tucker-pool-crm",label:"Tucker Pool CRM"},
 {owner,repo:"client-project-starter",label:"NBO Website"},
 {owner,repo:"otto-plumbing-site",label:"OTTO Plumbing Website"},
 {owner,repo:"dbarrera-y-mas",label:"D. Barrera y Más"}
];
export const CONTENT_REPO:RepoRef={owner,repo:"Command-Center-",label:"NBO Command Center"};
export const CONTENT_BRANCH="main";