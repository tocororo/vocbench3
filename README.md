# README #

### Prerequisites ###
Required npm that comes with [Node.js](https://nodejs.org/en/).
Verify that you are running at least node __v4.x.x__ and npm __3.x.x__ by running `node -v` and `npm -v` in a terminal/console window. Older versions may produce errors.

Required Semantic Turkey server running.

### Run the application ###

* Download the project
* From the project folder execute `npm install` to install all the dependencies
* Execute `npm start` to run the webpack lightweight server (it compiles and watches for file changes), then launch the application in a browser at page `localhost:8080` (unless you have changed the port in `package.json` `"start": "webpack-dev-server --inline --progress --port 8080"`)



### Creating a build ###
Execute `npm run build` to create a `dist` folder, a distribution deployable in an http server (tested with Tomcat 7.0.52 an 8.0.27).
In `config/webpack.prod.js` is possible to change the name of the produced folder simply by changing the `path` property in the `output` object
```
output: {
    path: helpers.root('dist'),
    ...    
},
```

### Further configuration ###
If *VocBench3* and the *SemanticTurkey* servers run on two different hosts, be sure to update the server ip that hosts *SemanticTurkey*, by changing in `config/webpack.prod.js` (if you are running VB3 in development mode with `npm start`) or `config/webpack.dev.js` (if you are creating a build with `npm run build`) the following
```
const SERVERHOST = '127.0.0.1:1979';
```