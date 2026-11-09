#!/bin/sh
set -eu
build_dir=$(mktemp -d)
trap 'rm -rf "$build_dir"' EXIT

./node_modules/.bin/tsc lib/public-github.ts lib/server-snapshot.ts lib/job-evidence.ts lib/github-panel-logic.ts lib/live-check.ts --outDir "$build_dir" --target es2021 --module commonjs --moduleResolution node --esModuleInterop --skipLibCheck

cp lib/execution-authority.mjs "$build_dir/"

route_build_dir="$build_dir/route"
mkdir -p "$route_build_dir"

cat << 'TSCONF' > tsconfig.route.json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "outDir": "$route_build_dir"
  },
  "include": [
    "app/api/live/route.ts"
  ]
}
TSCONF
# Substitute the variable inside the json
sed -i "s|\$route_build_dir|$route_build_dir|g" tsconfig.route.json

./node_modules/.bin/tsc --project tsconfig.route.json
rm -f tsconfig.route.json

# Relative path back to root from $route_build_dir/app/api/live/route.js
# route/app/api/live/route.js -> ../../../../live-check.js
sed -i "s|require(\"@/lib/live-check\")|require(\"../../../../live-check.js\")|g" "$route_build_dir/app/api/live/route.js" || true

NODE_PATH="$PWD/node_modules" NBO_TEST_BUILD="$build_dir" NBO_LIVE_BUILD="$build_dir" node --test tests/backend.test.cjs tests/github-panel.test.cjs tests/live-security.test.cjs tests/live-route.test.cjs
