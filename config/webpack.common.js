var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var helpers = require('./helpers');

module.exports = {

    /*
    We are splitting our application into three bundles:
     - polyfills - the standard polyfills we require to run Angular 2 applications in most modern browsers.
     - vendor - the vendor files we need: Angular 2, lodash, bootstrap.css...
     - app - our application code.
    */
    entry: {
        'polyfills': './src/polyfills.ts',
        'vendor': './src/vendor.ts',
        'app': './src/main.ts'
    },

    /*
    import {...} from 'path/to/component' <-- without extension
    We tell Webpack to resolve extension-less imported module with these extensions:
    - an explicit extension (signified by the empty extension string, '') or
    - .js extension (for regular JavaScript files and pre-compiled TypeScript files) or
    - .ts extension.
     */
    resolve: {
        extensions: ['', '.js', '.ts']
    },

    //Specify which loader processes which file
    module: {
        // preLoaders: [
        //     { test: /\.json$/, exclude: /node_modules/, loader: 'json'},
        // ],

        loaders: [
            //to fix issue https://github.com/shlomiassaf/angular2-modal/issues/244
            {
                test: /\.js$/,
                include: /(angular2-modal)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            //.ts files
            //ts loader transpiles the Typescript code to ES5, guided by the tsconfig.json file
            //angular2-template-loader loads angular components' template and styles
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            //.html files
            //html - for component templates
            {
                test: /\.html$/,
                loader: 'html'
            },
            //css files outside src/app/ (application-wide styles)
            //style and css loaders 
            {
                test: /\.css$/,
                exclude: helpers.root('src', 'app'),
                loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
            },
            //css files in src/app/ (component-scoped styles specified in a styleUrls metadata property)
            //raw loader loads them as strings (raw content of a file (as utf-8))
            {
                test: /\.css$/,
                include: helpers.root('src', 'app'),
                loader: 'raw'
            },
            //images files
            //file loader copies them in assets/images/ folder
            {
                test: /\.(png|jpe?g|gif|svg|ico)$/,
                loader: 'file?name=assets/images/[name].[ext]'
            },
            //fonts files
            //file loader copies them in assets/fonts/ folder
            {
                test: /\.(woff|woff2|ttf|eot)$/,
                loader: 'file?name=assets/fonts/[name].[ext]'
            },
        ]
    },

    plugins: [

        //This will let bootstrap to find jquery
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery'
        }),

        /*
        We want the app.js bundle to contain only app code and the vendor.js bundle to contain only the vendor code.
        Our application code imports vendor code. Webpack is not smart enough to keep the vendor code out of the app.js bundle
        (Memo: webpack follows the "import" chain [bundling A, A imports B, so bundling B as well, B imports C...] 
        to bundle the code, so following the components' imports, it could bundle vendor code with app code).
        We rely on the CommonsChunkPlugin to do that job.
        Where Webpack finds that app has shared dependencies with vendor, it removes them from app.
        It would do the same if vendor and polyfills had shared dependencies (which they don't).
        */
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),

        /*
        Webpack generates a number of js and css files. We could insert them into our index.html manually.
        That would be tedious and error-prone. Webpack can inject those scripts and links for us with the HtmlWebpackPlugin
         */
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            favicon: 'src/assets/images/logos/favicon.ico'
        })

    ]
};