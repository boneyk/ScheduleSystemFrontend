/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path');

const devServer = () => ({
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  static: {
    directory: path.join(__dirname, '../../../build'),
    serveIndex: true
  },
  port: 9006,
  historyApiFallback: {
    index: '/index.html'
  },
  client: {
    overlay: {
      errors: true,
      warnings: false,
      runtimeErrors: (error) => !error?.message?.includes('ResizeObserver loop')
    }
  }
});

module.exports = devServer;
