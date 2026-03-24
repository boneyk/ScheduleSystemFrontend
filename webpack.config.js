/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

const devServerConfig = require('./settings/webpack/devServer');
const loadersConfig = require('./settings/webpack/loaders');
const HtmlWebpackPlugin = require('html-webpack-plugin');
dotenv.config();

const version = fs.readFileSync(path.resolve(__dirname, './build/build-tag'));
const mode = process?.env?.NODE_ENV || 'development';
// const env = dotenv.config().parsed; может быть полезен в devServer и plugins

const isDev = mode === 'development';

// todo: вынести по аналогии с devServer
const outputSettings = {
  path: path.resolve(__dirname, 'build'),
  filename: `${version}/[name].js`,
  // chunks?
  chunkFilename: `${version}/[name].[contenthash].chunk.js`
};

module.exports = {
  entry: { index: './src/index' },
  mode,
  cache: true,
  devtool: 'source-map',
  output: outputSettings,
  target: 'web',
  devServer: devServerConfig(),
  //   optimization:
  // todo: вынести по аналогии с devServer
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      favicon: path.resolve(__dirname, 'public', 'favicon.svg'),
      logo: path.resolve(__dirname, 'public', 'logo.svg'),
      envsPath: '/',
      filename: './index.html',
      inject: true,
      base: '/'
    }),
    new webpack.DefinePlugin({
      BASE_URL_AUTH: JSON.stringify(process.env.BASE_URL_AUTH),
      BASE_URL_OFFICE: JSON.stringify(process.env.BASE_URL_OFFICE),
      BASE_URL_SCHEDULE: JSON.stringify(process.env.BASE_URL_SCHEDULE),
      BASE_URL_EMPLOYEE: JSON.stringify(process.env.BASE_URL_EMPLOYEE),
      BASE_URL_APPLICATION: JSON.stringify(process.env.BASE_URL_APPLICATION),
      BASE_URL_CATALOG: JSON.stringify(process.env.BASE_URL_CATALOG),
      BASE_URL_TELEMETRY: JSON.stringify(process.env.BASE_URL_TELEMETRY)
    })
  ],
  module: { rules: loadersConfig(isDev) },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
};
