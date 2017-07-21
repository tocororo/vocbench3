/**
 * Tells if the system should use the IP of the machine which is serving the VB3 content to query the ST server.
 * N.B. This can be left to true only if VocBench3 and SemanticTurkey are running on the same machine,
 * otherwise, set this to false and change the value of the st_host parameter
 */
var dynamic_st_host_resolution = true;

/**
 * IP address/logical host name of the machine which hosts SemanticTurkey.
 * Configure this parameter only if dynamic_st_host_resolution is set to false.
 */
var st_host = "127.0.0.1";

/**
 * Port where SemanticTurkey server is listening
 */
var st_port = "1979";

/**
 * Protocol - either http or https
 */
var st_protocol = "https";