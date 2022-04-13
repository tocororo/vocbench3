/*
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
 *  <reply status="fail">
 *      the serchString cannot be empty
 *  </reply>
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
 * New JSON response contains a "result" object (in case of error, the server returns an XML response)
 * example (getTopConcepts): 
 * {"result":[
 *      {"@id":"http://baseuri#concept1","role":"concept","more":false,"show":"concept 1"},
 *      {"@id":"http://baseuri#concept12","role":"concept","more":false,"show":"concept 2"}
 *      ...
 * ]}
 * 
 */

enum ContentType {
    applicationXml = "application/xml",
    applicationJson = "application/json"
}

export class STResponseUtils {

    public static ContentType = ContentType;

    /**
     * Returns the data content of the response
     */
    static getResponseData(stResp: any | Document) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("data")[0];
        } else { //JSON
            if (stResp.stresponse != undefined) {
                return stResp.stresponse.data; //old ST json response
            } else {
                return stResp.result; //new ST json response
            }
        }
    }

    /**
     * Returns true if the response is an error/exception/fail response
     */
    static isErrorResponse(stResp: any): boolean {
        return (this.isError(stResp) || this.isException(stResp) || this.isFail(stResp));
    }

    /**
     * Returns the error message in case the response is an error/exception/fail response
     * To use only in case isErrorResponse returns true
     */
    static getErrorResponseMessage(stResp: any): string {
        let msg: string;
        if (this.isError(stResp)) {
            msg = this.getErrorMessage(stResp);
        } else if (this.isException(stResp)) {
            msg = this.getExceptionMessage(stResp);
        } else if (this.isFail(stResp)) {
            msg = this.getFailMessage(stResp);
        }
        return msg;
    }

    static getErrorResponseExceptionName(stResp: any): string {
        return this.getExceptionName(stResp);
    }

    static getErrorResponseExceptionMessage(stResp: any): string {
        let message: string;
        //07/09/2017 currently ST return only exception error response, so I get directly the message of an exception response
        let errorMsg = this.getExceptionMessage(stResp);
        let errorMsgStartingIdx: number = 0;
        if (errorMsg.includes("Exception:")) {
            errorMsgStartingIdx = errorMsg.indexOf("Exception:") + "Exception:".length + 1; //+1 for the space after
        } else if (errorMsg.includes("Error:")) {
            errorMsgStartingIdx = errorMsg.indexOf("Error:") + "Error:".length + 1; //+1 for the space after
        }
        message = errorMsg.substring(errorMsgStartingIdx, errorMsg.length);
        return message;
    }

    static getErrorResponseExceptionStackTrace(stResp: any): string {
        return this.getExceptionStackTrace(stResp);
    }

    /**
     * Checks if the response is an exception response
     */
    private static isException(stResp: any): boolean {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("stresponse")[0].getAttribute("type") == "exception";
        } else { //JSON
            if (stResp.stresponse != undefined) {
                return stResp.stresponse.type == "exception"; //old json responses have stresponse object
            } else {
                return false; //new json responses, in case of error return an XML response
            }
        }
    }

    /**
     * Returns the exception message
     */
    private static getExceptionMessage(stResp: any): string {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("msg")[0].textContent;
        } else { //JSON
            return stResp.stresponse.msg;
        }
    }

    /**
     * Returns the exception name
     */
    private static getExceptionName(stResp: any): string {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("stresponse")[0].getAttribute("exception");
        } else { //JSON 
            return stResp.stresponse.exception;
        }
    }

    /**
     * Returns the exception stack trace
     */
    private static getExceptionStackTrace(stResp: any): string {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("stackTrace")[0].textContent;
        } else { //JSON 
            return stResp.stresponse.stackTrace;
        }
    }

    /**
     * Checks if the response is an exception response
     */
    private static isError(stResp: any): boolean {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("stresponse")[0].getAttribute("type") == "error";
        } else { //JSON
            if (stResp.stresponse != undefined) {
                return stResp.stresponse.type == "error"; //old json responses have stresponse object
            } else {
                return false; //new json responses, in case of error return an XML response
            }
        }
    }

    /**
     * Returns the exception message
     */
    private static getErrorMessage(stResp: any): string {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("msg")[0].textContent;
        } else { //JSON
            return stResp.stresponse.msg;
        }
    }

    /**
     * Checks if the response is a fail response
     */
    private static isFail(stResp: any): boolean {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("reply")[0].getAttribute("status") == "fail";
        } else { //JSON
            if (stResp.stresponse != undefined) {
                return stResp.stresponse.reply.status == "fail"; //old json responses have stresponse object
            } else {
                return false; //new json responses, in case of error return an XML response
            }
        }

    }

    /**
     * Returns the fail message
     */
    private static getFailMessage(stResp: any): string {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("reply")[0].textContent;
        } else { //JSON
            return stResp.stresponse.reply.msg;
        }
    }

}