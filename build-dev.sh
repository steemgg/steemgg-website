#!/bin/bash
cd ui
npm install
cd node_modules/webpack/node_modules
npm install uglifyjs-webpack-plugin@1.1.8
cd ../../../
npm run build-dev
cd ../
git clone https://github.com/steemgg/ui-dev.git
cp -rf  ui/dist/* ui-dev
cd ui-dev
git config user.name "bonjovis"
git config user.email "bonjovis1985@gmail.com"
git add .
git commit -a -m "commit"
git push --force --quiet "https://${GH_TOKEN}@github.com/steemgg/ui-dev.git"
