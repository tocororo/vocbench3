import { Observable } from "rxjs";
import { ARTNode } from "../../../models/ARTResources";
import { HttpServiceContext } from "../../../utils/HttpManager";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";

export class MultipleActionHelper {

    /**
     * Invokes an array of functions in order to add multiple values
     * @param functions array of observable to invoke with the related value that it is adding/deleting
     * @param basicModals service for showing a report of eventual error
     * @param errorHandler handler executed in case one of the add functions fails. If no provided a default handler (report dialog) will be executed
     * @param errors list of the errors collected during the recursively invocation of addMultiple().
     * @param onComplete function that will be executed once all the observable are completed
     */
    public static executeActions(functions: MultiActionFunction[], type: MultiActionType, basicModals: BasicModalServices, errorHandler?: (errors: MultiActionError[]) => void, errors?: MultiActionError[],
        onComplete?: (...args: any[]) => any) {
        if (errors == null) errors = [];

        HttpServiceContext.disableErrorInterception(); //temporarly disable the error interceptor

        if (functions.length == 0) { //no more function to call
            //handle the errors, if any, if an handler is defined
            if (errors.length > 0) {
                if (errorHandler != null) {
                    errorHandler(errors);
                } else {
                    if (errors.length == 1) {
                        this.handleSingleMultiActionError(errors[0], type, basicModals);
                    } else {
                        this.handleMultipleMultiActionError(errors, type, basicModals);
                    }
                }
            }
            HttpServiceContext.enableErrorInterception(); //re-enable the error interceptor
            if (onComplete != null) { //if provided, execute the onComplete handler
                onComplete();
            }
        } else {
            functions[0].function.subscribe(
                stResp => {
                    functions.shift(); //remove the first function (the one just called) and call itself recursively
                    this.executeActions(functions, type, basicModals, errorHandler, errors, onComplete);
                },
                err => {
                    errors.push({ value: functions[0].value, error: err }); //collect the value and the error catched
                    functions.shift(); //remove the first function (the one just called) and call itself recursively
                    this.executeActions(functions, type, basicModals, errorHandler, errors, onComplete);
                }
            );
        }
    }

    public static handleSingleMultiActionError(error: MultiActionError, type: MultiActionType, basicModals: BasicModalServices) {
        let message = "The " + type + " of " + error.value.toNT() + " has failed due to the following reason:\n" +  error.error.name + 
                ((error.error.message != null) ? ":\n" + error.error.message : "");
        let details = error.error.stack;
        basicModals.alert("Error", message, "error", details);
    }
    public static handleMultipleMultiActionError(errors: MultiActionError[], type: MultiActionType, basicModals: BasicModalServices) {
        let message = "The " + type + " of the following values have failed:"
        errors.forEach((e: MultiActionError) => {
            message += "\n\n" + e.value.toNT() + "\nReason:\n" + e.error.name + ((e.error.message != null) ? ":\n" + e.error.message : "");
        });
        basicModals.alert("Error", message, "error");
    }

}

export class MultiActionFunction {
    function: Observable<any>;
    value: ARTNode;
}

export class MultiActionError { 
    value: ARTNode;
    error: Error;
}

export enum MultiActionType {
    addition = "addition",
    deletion = "deletion"
}