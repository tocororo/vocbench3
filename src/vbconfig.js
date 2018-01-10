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
 * Port where SemanticTurkey server is listening (optional)
 */
var st_port = "1979";

/**   
 * Path where SemanticTurkey server is listening. If omitted, the sole host is considered.
 * Please note that the path of Semantic Turkey services is defined as in:
 *  http://semanticturkey.uniroma2.it/doc/user/web_api.jsf#services_address_structure
 *  This additional path information is considered to be the starting part of the path described above, 
 *  and is usually necessary in case Semantic Turkey is installed behind a proxy redirecting the ST URL.
 */ 
var st_path;

/**
 * Protocol - either http or https
 */
var st_protocol = "http";