// Central config. The Today/Work screens read from READ_REPOS.
// The app only ever COMMITS to CONTENT_REPO.
// Adding the Psychiatry repo later = one line in READ_REPOS.

export type RepoRef = {
  owner: string;
  repo: string;
  label: string; // friendly name shown in the UI
};

export const READ_REPOS: RepoRef[] = [
  { owner: "ejnburrows-rgb", repo: "otto", label: "Otto Plumbing CRM" },
  { owner: "ejnburrows-rgb", repo: "cartilla-de-gretel", label: "Gretel Hub (Cartilla)" },
  { owner: "ejnburrows-rgb", repo: "lany-books-web", label: "Landing Books" },
];

export const CONTENT_REPO: RepoRef = {
  owner: "ejnburrows-rgb",
  repo: "command-center",
  label: "Command Center",
};

// Default branch we read from / commit to on the content repo.
export const CONTENT_BRANCH = "main";
