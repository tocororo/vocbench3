# README #

Required npm that comes with [Node.js](https://nodejs.org/en/).
Verify that you are running at least node __v4.x.x__ and npm __3.x.x__ by running `node -v` and `npm -v` in a terminal/console window. Older versions may produce errors.

### Run the application ###

* Download the project
* From the project folder execute `npm install` to install all the dependencies
* Execute `npm start` to run the server in **development mode** (it compiles and watches for file changes) and to launch the application in a browser.

### Creating a build ###
Execute `npm run build` to create a `dist` folder, a distribution deployable in an http server (tested with Tomcat 7.0.52 an 8.0.27).
In `config/webpack.prod.js` is possible to change the name of the produced folder simply by changing the `path` property in the `output` object
```
output: {
    path: helpers.root('dist'),
    ...    
},
```
If *VocBench3* and the *SemanticTurkey* server run on two different hosts, be sure to update the server ip that hosts *SemanticTurkey*, by changing in `config/webpack.prod.js` the following
```
const SERVERHOST = '127.0.0.1';
```