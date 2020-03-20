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
        extensions: ['.js', '.ts']
    },

    //Specify which loader processes which file
    module: {
        rules: [
            //awesome-typescript-loader loader to transpile the Typescript code to ES5, guided by the tsconfig.json file.
            //angular2-template-loader loads angular components' template and styles
            {
                test: /\.ts$/,
                loaders: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: { configFileName: helpers.root('.', 'tsconfig.json') }
                    } , 'angular2-template-loader'
                ]
            },
            //html-loader for component template
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            //css files outside src/app/ (application-wide styles)
            {
                test: /\.css$/,
                exclude: helpers.root('src', 'app'),
                loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader?sourceMap' })
            },
            //css files in src/app/ (component-scoped styles specified in a styleUrls metadata property)
            //raw loader loads them as strings (raw content of a file (as utf-8))
            {
                test: /\.css$/,
                include: helpers.root('src', 'app'),
                loader: 'raw-loader'
            },
            //images files
            //file loader copies them in assets/images/ folder
            {
                test: /\.(png|jpe?g|gif|svg|ico)$/,
                exclude: helpers.root('src', 'assets', 'ext', 'home'),
                loader: 'file-loader?name=assets/images/[name].[ext]'
            },
            //fonts files
            //file loader copies them in assets/fonts/ folder
            {
                test: /\.(woff|woff2|ttf|eot)$/,
                loader: 'file-loader?name=assets/fonts/[name].[ext]'
            },
            //files about home page customization: the file-loader copies them in assets/ext/home/ folder
            {
                test: /\.(html|png)$/,
                include: helpers.root('src', 'assets', 'ext', 'home'),
                loader: 'file-loader?name=assets/ext/home/[name].[ext]'
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

        // Workaround for https://github.com/angular/angular/issues/11580 (see https://angular.io/guide/webpack#common-configuration)
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)@angular/,
            helpers.root('./src'), // location of your src
            {} // a map of your routes
        ),

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
        }),

    ]
};