#!/bin/bash

echo "🔨 Removing old buid folder" &&
rm -rf ./dist/ &&
rm -rf ./build/ &&
echo "✅  Done\n" &&

echo "🔨  Building server" &&
yarn tsc --build utils/tsconfig.server.build.json &&
echo "✅  Done\n" &&

echo "🔨  Building React app" &&
yarn react-scripts build &&
mv build dist/public &&
echo "✅  Done\n" &&

echo '✅  🙌  🙌  🙌  Build finished, run `yarn serve` or manually start `dist/index.js` file to start rolling!'