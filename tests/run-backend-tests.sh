#!/bin/sh
set -eu
build_dir=$(mktemp -d)
trap 'rm -rf "$build_dir"' EXIT

# Copy lib files needed by tests
cp lib/*.mjs "$build_dir/"

cat << 'TSCONF' > "tsconfig.test.json"
{
  "compilerOptions": {
    "target": "es2021",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "lib/public-github.ts",
    "lib/server-snapshot.ts",
    "lib/job-evidence.ts",
    "lib/github-panel-logic.ts",
    "lib/live-check.ts",
    "app/api/auth/route.ts",
    "lib/auth.ts"
  ]
}
TSCONF

# Mock next/server and other Next.js modules
cat << 'MOCK' > "$build_dir/next-server-mock.d.ts"
declare module 'next/server' {
    export class NextResponse extends Response {
        static json(body: any, init?: ResponseInit): NextResponse;
        cookies: {
            set(name: string, value: string, options?: any): void;
        };
    }
}
declare module 'next/cache' {
    export function unstable_cache(fn: any, keys?: string[], opts?: any): any;
}
declare module 'next/headers' {
    export function cookies(): any;
}
declare global { interface RequestInit { next?: any } }
MOCK

# Compile TypeScript files maintaining directory structure
./node_modules/.bin/tsc -p tsconfig.test.json --outDir "$build_dir"
rm tsconfig.test.json

# Copy all compiled .js files from lib into root of build_dir so require works for existing tests
find "$build_dir/lib" -name "*.js" -exec cp {} "$build_dir/" \;

route_file="$build_dir/app/api/auth/route.js"
if [ -f "$route_file" ]; then
    sed -i -E 's|require\("[^"]*auth"\)|require("../../../lib/auth")|g' "$route_file"
    sed -i -E "s|require\('[^']*auth'\)|require('../../../lib/auth')|g" "$route_file"
fi

NODE_PATH="$PWD/node_modules" NBO_TEST_BUILD="$build_dir" NBO_LIVE_BUILD="$build_dir" node --test tests/backend.test.cjs tests/github-panel.test.cjs tests/live-security.test.cjs tests/auth.test.cjs
