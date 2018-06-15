#!/bin/bash

cd ui
npm install
cd node_modules/webpack/node_modules
npm install uglifyjs-webpack-plugin@1.1.8
cd ../../../
npm run build-prod
cd ../
tar -cvf  ui-prod.tar.gz ui/dist/
git clone https://github.com/steemgg/ui-dev.git
cp -rf  ui/dist/* ui-dev
cd ui-dev
git commit -a -m "commit"
git push
cd ../
rm -rf ui/dist/
cd ui
npm run build-staging
cd ../
tar -cvf  ui-staging.tar.gz ui/dist/
git clone https://github.com/steemgg/ui-staging.git
cp -rf  ui/dist/* ui-staging
cd ui-staging
git commit -a -m "commit"
git push
cd ../
rm -rf ui/dist/
