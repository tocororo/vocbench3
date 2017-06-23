var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

//'dev' run angular2 in dev mode, 'prod' or anything else enables angular2 production mode. In production dist this should always be 'prod'.
const ENV = process.env.NODE_ENV = process.env.ENV = 'prod';

module.exports = webpackMerge(commonConfig, {
    devtool: 'source-map',

    /*
    This time the output bundle files are physically placed in the dist folder
    (not like dev mode where webpack keep all in memory).
     */
    output: {
        path: helpers.root('dist'),
        publicPath: './', //this is placed as prefix of the reference (href) of the imported script and css in index.html
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].chunk.js'
    },

    plugins: [
        //stops the build if there is any error.
        new webpack.NoEmitOnErrorsPlugin(),

        //minifies the bundles. https://github.com/angular/angular/issues/10618
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                keep_fnames: true
            }
        }),

        //extracts embedded css as external files, adding cache-busting hash to the filename
        new ExtractTextPlugin('[name].[hash].css'),
       
        /*
        Use to define environment variables that we can reference within our application
        Thanks to this Plugin and the ENV variable defined at top, we can enable Angular 2 production mode
        in main.ts like this:
        if (process.env.ENV !== 'dev') {
        enableProdMode();
        }
        */
        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV),
            }
        }),

        //to override options of certain loaders.
        new webpack.LoaderOptionsPlugin({
            htmlLoader: {
                minimize: false // workaround for ng2
            }
        })
    ]
});

/* 
to generate the build run
npm run build
*/