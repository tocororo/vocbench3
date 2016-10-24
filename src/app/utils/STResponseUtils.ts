/**
 * This class provides utilities to handle the ST services responses.
 * A service's response could be JSON or XML. For each of these 3 response type are available
 * - reply: see below
 * - exception: missing parameter, wrong request name (old type services), or exception thrown in method
 * - error: used not so much (found just 1 time in removePropValue when value type is not recognized)
 * 
 * Reply status could be
 * - ok: everything went well
 * - fail: something gone wrong, e.g. valid but wrong request parameter
 * - warning: almost never used (just in PluginAdapter activate() and deactivate() methods)
 * 
 * Response Examples
 * 
 * Type "reply", 
 * 
 * Status "ok"
 * <stresponse request="requestName" type="reply">
 *  <reply status="ok"/>
 *  <data>
 *      xml response content
 *  </data>
 * </stresponse>
 * 
 * Status "fail"
 * http://127.0.0.1:1979/semanticturkey/it.uniroma2.art.semanticturkey/st-core-services/Search/
 * searchResource?searchString=&rolesArray=cls&useLocalName=false&useURI=true&searchMode=start&ctx_project=...
 * <stresponse request="searchResource" type="reply">
 *  <reply status="fail"/>
 *  <data>
 *      the serchString cannot be empty
 *  </data>
 * </stresponse>
 * 
 * Type "exception"
 * http://127.0.0.1:1979/semanticturkey/resources/stserver/STServer?service=cls&request=getSubClasses&
 * clName=http%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23Thing&tree=true&instNum=true&ctx_project=...
 * <stresponse request="getSubClasses" type="exception">
 *   <msg>missing http parameter: clsName from http request</msg>
 * </stresponse>
 * 
 * JSON responses are structured as the xml responses
 * { 
 *  "stresponse": {
 *      "request": "requestName",
 *      "data": { 
 *          json response content... 
 *      },
 *      "type": "reply",
 *      "reply": {
 *          "status": "ok"
 *      }
 *  }
 * }
 * 
 */

export class STResponseUtils {
    
    private static contentTypeXml: string = "application/xml";
    private static contentTypeJson: string = "application/json";

    /**
     * Returns the data content of the response
     */
    static getResponseData(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("data")[0];
        } else { //JSON
            return stResp.stresponse.data;
        }
    }
    
    /**
     * Returns true if the response is an error/exception/fail response
     */
    static isErrorResponse(stResp): boolean {
        return (this.isError(stResp) || this.isException(stResp) || this.isFail(stResp));
    }
    
    /**
     * Returns the error message in case the response is an error/exception/fail response
     * To use only in case isErrorResponse returns true
     */
    static getErrorResponseMessage(stResp): string {
        var msg;
        if (this.isError(stResp)) {
            msg = this.getErrorMessage(stResp);
        } else if (this.isException(stResp)) {
            msg = this.getExceptionMessage(stResp);
        } else if (this.isFail(stResp)) {
            msg = this.getFailMessage(stResp);
        }
        return msg;
    }
    
    /**
     * Checks if the response is an exception response
     */
    private static isException(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("stresponse")[0].getAttribute("type") == "exception";
        } else { //JSON
            return stResp.stresponse.type == "exception";
        }
    }
    
    /**
	 * Returns the exception message
	 */
    private static getExceptionMessage(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("msg")[0].textContent;
        } else { //JSON
            return stResp.stresponse.msg;
        }
    }
	
	/**
	 * Checks if the response is an exception response
	 */
    private static  isError(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("stresponse")[0].getAttribute("type") == "error";
        } else { //JSON
            return stResp.stresponse.type == "error";
        }
    }
	
	/**
	 * Returns the exception message
	 */
    private static getErrorMessage(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("msg")[0].textContent;
        } else { //JSON
            return stResp.stresponse.msg;
        }
    }
	
	/**
	 * Checks if the response is a fail response
	 */
    private static isFail(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("reply")[0].getAttribute("status") == "fail";
        } else { //JSON
            return stResp.stresponse.reply.status == "fail";
        }

    }
	
	/**
	 * Returns the fail message
	 */
    private static getFailMessage(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("reply")[0].textContent;
        } else { //JSON
            return stResp.stresponse.reply.msg;
        }
    }

}