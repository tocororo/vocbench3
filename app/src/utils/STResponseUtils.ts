import {Injectable} from 'angular2/core';

@Injectable()
export class STResponseUtils {
    
    //TODO: check if with JSON response this works. 
    //I doubt it, in case, first check typeof stResp (if (stResp instanceof Document))
    private contentTypeXml: string = "application/xml";
    private contentTypeJson: string = "application/json";

    constructor() { }
    
    /**
     * Returns the data content of the response
     */
    getResponseData(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("data")[0];
        } else { //JSON
            return stResp.stresponse.data;
        }
    }
    
    /**
     * Returns true if the response is an error/exception/fail response
     */
    isErrorResponse(stResp): boolean {
        return (this.isError(stResp) || this.isException(stResp) || this.isFail(stResp));
    }
    
    /**
     * Returns the error message in case the response is an error/exception/fail response
     * To use only in case isErrorResponse returns true
     */
    getErrorResponseMessage(stResp): string {
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
    private isException(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("stresponse")[0].getAttribute("type") == "exception";
        } else { //JSON
            return stResp.stresponse.type == "exception";
        }
    }
    
    /**
	 * Returns the exception message
	 */
    private getExceptionMessage(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("msg")[0].textContent;
        } else { //JSON
            return stResp.stresponse.msg;
        }
    }
	
	/**
	 * Checks if the response is an exception response
	 */
    private isError(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("stresponse")[0].getAttribute("type") == "error";
        } else { //JSON
            return stResp.stresponse.type == "error";
        }
    }
	
	/**
	 * Returns the exception message
	 */
    private getErrorMessage(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("msg")[0].textContent;
        } else { //JSON
            return stResp.stresponse.msg;
        }
    }
	
	/**
	 * Checks if the response is a fail response
	 */
    private isFail(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("reply")[0].getAttribute("status") == "fail";
        } else { //JSON
            return stResp.stresponse.reply.status == "fail";
        }

    }
	
	/**
	 * Returns the fail message
	 */
    private getFailMessage(stResp) {
        if (stResp instanceof Document) { //XML
            return stResp.getElementsByTagName("reply")[0].textContent;
        } else { //JSON
            return stResp.stresponse.reply.msg;
        }
    }

}