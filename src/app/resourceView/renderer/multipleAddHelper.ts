import { Observable } from "rxjs";
import { ARTNode } from "../../models/ARTResources";
import { HttpServiceContext } from "../../utils/HttpManager";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { EventEmitter } from "@angular/core";

export class MultipleAddHelper {

    /**
     * Invokes an array of functions in order to add multiple values
     * @param addFunctions array of observable to invoke with the related value that it is adding
     * @param basicModals service for showing a report of eventual error
     * @param errorHandler handler executed in case one of the add functions fails. If no provided a default handler (report dialog) will be executed
     * @param errors list of the errors collected during the recursively invocation of addMultiple().
     * @param onComplete function that will be executed once all the observable are completed
     */
    public static addMultiple(addFunctions: MultiAddFunction[], basicModals: BasicModalServices, errorHandler?: (errors: MultiAddError[]) => void, errors?: MultiAddError[],
        onComplete?: (...args: any[]) => any) {
        if (errors == null) errors = [];

        HttpServiceContext.disableErrorInterception(); //temporarly disable the error interceptor

        if (addFunctions.length == 0) { //no more function to call
            //handle the errors, if any, if an handler is defined
            if (errors.length > 0) {
                if (errorHandler != null) {
                    errorHandler(errors);
                } else {
                    if (errors.length == 1) {
                        this.handleSingleMultiAddError(errors[0], basicModals);
                    } else {
                        this.handleMultipleMultiAddError(errors, basicModals);
                    }
                }
            }
            HttpServiceContext.enableErrorInterception(); //re-enable the error interceptor
            if (onComplete != null) { //if provided, execute the onComplete handler
                onComplete();
            }
        } else {
            addFunctions[0].function.subscribe(
                stResp => {
                    addFunctions.shift(); //remove the first function (the one just called) and call itself recursively
                    this.addMultiple(addFunctions, basicModals, errorHandler, errors, onComplete);
                },
                err => {
                    errors.push({ value: addFunctions[0].value, error: err }); //collect the value and the error catched
                    addFunctions.shift(); //remove the first function (the one just called) and call itself recursively
                    this.addMultiple(addFunctions, basicModals, errorHandler, errors, onComplete);
                }
            );
        }
    }

    public static handleSingleMultiAddError(error: MultiAddError, basicModals: BasicModalServices) {
        let message = "The addition of " + error.value.toNT() + " has failed due to the following reason:\n" +  error.error.name + 
                ((error.error.message != null) ? ":\n" + error.error.message : "");
        let details = error.error.stack;
        basicModals.alert("Error", message, "error", details);
    }
    public static handleMultipleMultiAddError(errors: MultiAddError[], basicModals: BasicModalServices) {
        let message = "The addition of the following values have failed:"
        errors.forEach((e: MultiAddError) => {
            message += "\n\n" + e.value.toNT() + "\nReason:\n" + e.error.name + ((e.error.message != null) ? ":\n" + e.error.message : "");
        });
        basicModals.alert("Error", message, "error");
    }

}

export class MultiAddFunction {
    function: Observable<any>;
    value: ARTNode;
}

export class MultiAddError { 
    value: ARTNode;
    error: Error;
}