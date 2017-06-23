# README #

### Prerequisites ###
Required [Node.js and npm](https://nodejs.org/en/download).
Verify that you are running at least node __v6.9.x__ and npm __3.x.x__ by running `node -v` and `npm -v` in a terminal/console window. Older versions may produce errors.

Required Semantic Turkey server running.

### Run the application ###

* Download the project
* From the project folder execute `npm install` (or `npm i`) to install all the dependencies
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
In *vbconfis.js* (under *src/* of the source package, or under the root folder of the built distribution) it is possible to configure the *SemanticTurkey* host resolution.
By default *VocBench3* resolves the IP address of the *SemanticTurkey* server dynamically by using the same IP address of the *VocBench* host machine.
This is determined by the configuration property `dynamic_st_host_resolution` (by default set to `true`).
```
/**
 * Tells if the system should use the IP of the machine which is serving the VB3 content to query the ST server.
 * N.B. This can be left to true only if VocBench3 and SemanticTurkey are running on the same machine,
 * otherwise, set this to false and change the value of the st_host parameter
 */
var dynamic_st_host_resolution = true;
```
In case *VocBench3* and *SemanticTurkey* run on two different hosts, it is possible to provide the *SemanticTurkey* IP address statically by setting the previous property to `false` and modifying 
the property `st_host` with the address of the target host (the property `st_host` is ignored if `dynamic_st_host_resolution` is `true`).
```
var dynamic_st_host_resolution = false;
/**
 * IP address/logical host name of the machine which hosts SemanticTurkey.
 * Configure this parameter only if dynamic_st_host_resolution is set to false.
 */
var st_host = "127.0.0.1";
```
It is also possible to change the port where SemanticTurkey is listening (the default is `1979`) by changing `st_port` property.
```
/**
 * Port where SemanticTurkey server is listening
 */
var st_port = "1979";
```