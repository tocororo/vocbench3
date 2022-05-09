import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ARTBNode, ARTNode, ARTURIResource } from "../models/ARTResources";
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class ManchesterServices {

    private serviceName = "ManchesterHandler";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Checks if a manchester expression in valid
     * @param manchExpr manchester expression to check
     */
    checkExpression(manchExpr: string, skipSemanticCheck?: boolean): Observable<ExpressionCheckResponse> {
        let params = {
            manchExpr: manchExpr,
            skipSemanticCheck: skipSemanticCheck
        };
        return this.httpMgr.doGet(this.serviceName, "checkExpression", params);
    }


    /**
     * returns true if the expression is compliant with the syntax of datatype restrictions, false otherwise
     * @param manchExpr 
     */
    checkDatatypeExpression(manchExpr: string): Observable<ExpressionCheckResponse> {
        let params = {
            manchExpr: manchExpr
        };
        return this.httpMgr.doGet(this.serviceName, "checkDatatypeExpression", params);
    }

    /**
     * returns true if the expression is compliant with the syntax of datatype restriction enumeration-based
     * @param manchExpr 
     */
    checkLiteralEnumerationExpression(manchExpr: string): Observable<ExpressionCheckResponse> {
        let params = {
            manchExpr: manchExpr
        };
        return this.httpMgr.doGet(this.serviceName, "checkLiteralEnumerationExpression", params);
    }

    /**
     * Creates a restriction
     * @param cls the subject class of the restriction
     * @param predicate
     * @param manchExpr manchester expression used to create restriction
     */
    createRestriction(cls: ARTURIResource, predicate: ARTURIResource, manchExpr: string, skipSemanticCheck?: boolean) {
        let params = {
            classIri: cls,
            exprType: predicate,
            manchExpr: manchExpr,
            skipSemanticCheck: skipSemanticCheck
        };
        return this.httpMgr.doPost(this.serviceName, "createRestriction", params);
    }

    /**
     * Removes a restriction
     * @param cls the subject class of the restriction
     * @param predicate
     * @param manchExpr manchester expression to check
     */
    removeExpression(cls: ARTURIResource, predicate: ARTURIResource, bnode: ARTNode) {
        let params = {
            classIri: cls,
            exprType: predicate,
            bnode: bnode
        };
        return this.httpMgr.doPost(this.serviceName, "removeExpression", params);
    }

    /**
     * Updates a restrinction expressed by a manchester expression
     * @param newManchExpr 
     * @param bnode bnode that represents the restriction
     */
    updateExpression(newManchExpr: string, bnode: ARTBNode, skipSemanticCheck?: boolean) {
        let params = {
            newManchExpr: newManchExpr,
            bnode: bnode,
            skipSemanticCheck: skipSemanticCheck
        };
        return this.httpMgr.doPost(this.serviceName, "updateExpression", params);
    }

    isClassAxiom(bnode: ARTBNode): Observable<boolean> {
        let params = {
            bnode: bnode
        };
        return this.httpMgr.doGet(this.serviceName, "isClassAxiom", params);
    }


}


export class ExpressionCheckResponse {
    public valid: boolean;
    public details: ObjectError[];
}

export class ObjectError {
    public msg: string;
    public type: string;
    // semantic
    public iri?: string;
    public qname?: string;
    public occurrence?: number; // in case type = syntactic it indicates the position of the first character of the string containing the error otherwise it indicates word occurrence (es: first, second ecc..) 
    //syntactic
    public offendingTerm: string;
    public expectedTokens: string[];
    public prefix: string;
}



