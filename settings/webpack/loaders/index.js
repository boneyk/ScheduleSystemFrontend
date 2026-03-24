/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path');
const babelConfig = path.resolve(__dirname, '../../babel/babel.config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const loaders = (isDev) => [
  {
    test: /\.(js|jsx)?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          sourceMap: true,
          configFile: babelConfig
        }
      }
    ]
  },
  {
    test: /\.(png|jpe?g|gif|svg)$/i,
    type: 'asset/resource'
  },
  {
    test: /\.css$/,
    use: [
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            config: path.resolve(process.cwd(), 'postcss.config.mjs')
          }
        }
      }
    ]
  },
  {
    test: /\.s[ac]ss$/,
    use: [
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: { modules: { namedExport: false, exportLocalsConvention: 'camelCase' } }
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            config: path.resolve(process.cwd(), 'postcss.config.mjs')
          }
        }
      },
      'sass-loader'
    ]
  },
  {
    test: /\.(woff|woff2|eot|ttf)(\?[a-z0-9=.]+)?$/,
    loader: 'file-loader'
  },
  {
    test: /\.tsx?$/,
    loader: 'ts-loader',
    exclude: /node_modules/
  }
];

module.exports = loaders;
