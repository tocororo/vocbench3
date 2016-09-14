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