#!/bin/bash

cd ui
npm install
cd node_modules/webpack/node_modules
npm install uglifyjs-webpack-plugin@1.1.8
cd ../../../
echo $TRAVIS_BRANCH
echo $TRAVIS_TAG
if [[ $TRAVIS_BRANCH == 'develop' ]]; then
    npm run build-dev
    cd ../
    #tar -cvf  ui-prod.tar.gz ui/dist/
    git clone https://github.com/steemgg/ui-dev.git
    cp -rf  ui/dist/* ui-dev
    cd ui-dev
    git config user.name "bonjovis"
    git config user.email "bonjovis1985@gmail.com"
    git add .
    git commit -a -m "commit"
    git push --force --quiet "https://${GH_TOKEN}@github.com/steemgg/ui-dev.git"
    cd ../
    rm -rf ui/dist/
elif [[ $TRAVIS_BRANCH == 'master' ]]; then
    npm run build-staging
    cd ../
    #tar -cvf  ui-staging.tar.gz ui/dist/
    git clone https://github.com/steemgg/ui-staging.git
    cp -rf  ui/dist/* ui-staging
    cd ui-staging
    git config user.name "bonjovis"
    git config user.email "bonjovis1985@gmail.com"
    git add .
    git commit -a -m "commit"
    git push --force --quiet "https://${GH_TOKEN}@github.com/steemgg/ui-staging.git"
    cd ../
    rm -rf ui/dist/
else
    echo 'helloworld'
fi
if [[ $TRAVIS_TAG =~'^v*$' ]]; then
    echo 'build release code'
    cd ui
    npm install
    cd node_modules/webpack/node_modules
    npm install uglifyjs-webpack-plugin@1.1.8
    cd ../../../
    npm run build-prod
    cd ../
    tar -cvf  release_$TRAVIS_TAG.tar.gz ui/dist/
    git clone https://github.com/steemgg/ui-prod.git
    cp -rf  ui/dist/* ui-prod
    cd ui-prod
    git config user.name "bonjovis"
    git config user.email "bonjovis1985@gmail.com"
    git add .
    git commit -a -m "commit"
    git push --force --quiet "https://${GH_TOKEN}@github.com/steemgg/ui-prod.git"
fi
