const webpack = require('webpack');
const { parsed: localEnv } = require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env',
});

module.exports = {
  webpack(config) {
    config.plugins.push(new webpack.EnvironmentPlugin(localEnv));
    return config;
  },
};
