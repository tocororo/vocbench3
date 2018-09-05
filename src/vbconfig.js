/**
 * IP address/logical host name of the machine which hosts SemanticTurkey.
 * By default it is resolved dynamically by using the same address of the *VocBench* host machine,
 * (if VocBench3 and SemanticTurkey are running on the same machine this can be left commented),
 * if you want to change the address you must uncomment the line and edit the value.
 */
// var st_host = "127.0.0.1";

/**
 * Port where SemanticTurkey server is listening.
 * By default it is resolved dynamically by using the same port of the *VocBench* host machine,
 * (if VocBench3 and SemanticTurkey are running on the same container this can be left commented),
 * if you want to change the port you must uncomment the line and edit the value.
 */
// var st_port = "1979";

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