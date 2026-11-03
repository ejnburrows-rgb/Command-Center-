## 2024-11-01 - Fast Date Sorting
**Learning:** Using `localeCompare` for sorting ISO 8601 date strings is a common performance anti-pattern. While convenient, `localeCompare` invokes the internationalization API which is significantly slower than standard JS string comparison operators. This is especially impactful when sorting large lists of items (like comments, PRs, and issues) on both frontend and backend.
**Action:** Replace `a.date.localeCompare(b.date)` with direct string comparison `a.date < b.date ? -1 : (a.date > b.date ? 1 : 0)` when sorting ISO 8601 strings.
