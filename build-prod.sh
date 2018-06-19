#!/bin/bash

cd ui
npm install
cd node_modules/webpack/node_modules
npm install uglifyjs-webpack-plugin@1.1.8
cd ../../../
npm run build-prod
cd ../
tar -cvf  ui-prod.tar.gz ui/dist/
git clone https://github.com/steemgg/ui-prod.git
cp -rf  ui/dist/* ui-prod
cd ui-prod
git config user.name "bonjovis"
git config user.email "bonjovis1985@gmail.com"
git add .
git commit -a -m "commit"
git push --force --quiet "https://${GH_TOKEN}@github.com/steemgg/ui-prod.git"
