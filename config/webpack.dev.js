/*
The webpack.common.js configuration file does most of the heavy lifting.
We create separate, environment-specific configuration files that build on webpack.common
by merging into it the peculiarities particular to their target environments.

Here is the development configuration file, webpack.dev.js
 */

var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-eval-source-map',

  /*
  We tell Webpack to put output bundles in the dist folder, the dev server keeps all bundles in memory;
  it doesn't write them to disk. So we won't find any files in the dist folder (at least not any generated from this development build)

  The HtmlWebpackPlugin (added in webpack.common.js) use the publicPath and the filename settings
  to generate appropriate <script> and <link> tags into the index.html.
   */
  output: {
    path: helpers.root('dist'),
    publicPath: 'http://localhost:8080/',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  },

  /*
  Our CSS are buried inside our Javascript bundles by default.
  The ExtractTextPlugin extracts them into external .css files that the HtmlWebpackPlugin inscribes as <link> tags into the index.html
   */
  plugins: [
    new ExtractTextPlugin('[name].css')
  ],

  /*
  The development build relies on the Webpack development server which we configure here
   */
  devServer: {
    historyApiFallback: true,
    stats: 'minimal'
  }
});

//npm start to run in devServer
