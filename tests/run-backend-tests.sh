#!/bin/sh
set -eu
build_dir=$(mktemp -d)
trap 'rm -rf "$build_dir"' EXIT
./node_modules/.bin/tsc lib/public-github.ts lib/server-snapshot.ts lib/job-evidence.ts --outDir "$build_dir" --target es2021 --module commonjs --moduleResolution node --esModuleInterop --skipLibCheck
NODE_PATH="$PWD/node_modules" NBO_TEST_BUILD="$build_dir" node --test tests/backend.test.cjs
