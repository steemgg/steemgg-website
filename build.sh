cd ui
npm install
cd node_modules/webpack/node_modules
npm install uglifyjs-webpack-plugin@1.1.8
cd ../../../
npm run build-prod
cd ../
tar -cvf  ui.tar.gz ui/dist/
#npm run build-staging
