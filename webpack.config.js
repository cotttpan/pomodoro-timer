const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const NotifierPlugin = require('webpack-notifier')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const autoprefixer = require('autoprefixer')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const NODE_ENV = process.env.NODE_ENV || 'development'
const isProd = (NODE_ENV === 'production')

console.log('NODE_ENV:', NODE_ENV) // tslint:disable-line

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: ['./index.ts', './index.scss'],
    // vendor: ['react', 'react-dom', 'redux', 'dexie'],
  },
  output: {
    path: path.join(__dirname, 'docs'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /(\/node_modules\/|\.test\.tsx?$)/,
        loader: 'awesome-typescript-loader?module=esnext',
      },
      {
        test: /\.(css|scss|sass)$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            `css-loader?importLoaders=3&minimize=${isProd}`,
            'postcss-loader',
            'sass-loader',
            'import-glob-loader',
          ],
        }),
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new NotifierPlugin({ title: 'Webpack' }),
    new HTMLWebpackPlugin({
      filename: 'index.html',
      template: './index.ejs',
      hash: true,
      inject: false,
      env: NODE_ENV,
    }),
    new ExtractTextPlugin({
      filename: '[name].bundle.css',
      disable: !isProd,
    }),
    // new BundleAnalyzerPlugin(),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       vendor: {
  //         test: 'vendor',
  //         name: 'vendor',
  //         chunks: 'initial',
  //         enforce: true,
  //       },
  //     },
  //   },
  // },
  devtool: isProd ? 'none' : 'inline-source-map',
  devServer: {
    contentBase: 'docs',
    historyApiFallback: true,
    noInfo: true,
    hot: true,
  },
}
