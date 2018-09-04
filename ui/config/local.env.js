'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_SERVER_URL: '""',
  APP_ID: '"steemgg.app"',
  IPFS_SERVER_URL: '"https://ipfs.io/ipfs/"'
})
