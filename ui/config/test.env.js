'use strict'
const merge = require('webpack-merge')
const devEnv = require('./local.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"'
})
