import {Injectable} from 'angular2/core';

@Injectable()
export class STResponseUtils {
    
    //TODO: check if with JSON response this works. 
    //I doubt it, in case, first check typeof stResp (if (stResp instanceof Document))
    
	constructor() {}
    
    /**
     * Checks if the response is an exception response
     */
    isException(stResp) {
        return stResp.getElementsByTagName("stresponse")[0].getAttribute("type") == "exception";
    }
    
    /**
	 * Returns the exception message
	 */
	getExceptionMessage(stResp) {
		return stResp.getElementsByTagName("msg")[0].textContent;
	}
	
	/**
	 * Checks if the response is an exception response
	 */
	isError(stResp) {
		return stResp.getElementsByTagName("stresponse")[0].getAttribute("type") == "error";
	}
	
	/**
	 * Returns the exception message
	 */
	getErrorMessage(stResp) {
		return stResp.getElementsByTagName("msg")[0].textContent;
	}
	
	/**
	 * Checks if the response is a fail response
	 */
	isFail(stResp) {
		return stResp.getElementsByTagName("reply")[0].getAttribute("status") == "fail";
	}
	
	/**
	 * Returns the fail message
	 */
	getFailMessage(stResp) {
		return stResp.getElementsByTagName("reply")[0].textContent;
	}
    
}