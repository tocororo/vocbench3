import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { ARTURIResource, ARTNode, ARTBNode } from "../models/ARTResources";

@Injectable()
export class ManchesterServices {

    private serviceName = "ManchesterHandler";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Checks if a manchester expression in valid
     * @param manchExpr manchester expression to check
     */
    checkExpression(manchExpr: string) {
        var params = {
            manchExpr: manchExpr
        };
        return this.httpMgr.doGet(this.serviceName, "checkExpression", params);
    }


    /**
     * returns true if the expression is compliant with the syntax of datatype restrions, false otherwise
     * @param manchExpr 
     */
    checkDatatypeExpression(manchExpr: string): Observable<boolean> {
        var params = {
            manchExpr: manchExpr
        };
        return this.httpMgr.doGet(this.serviceName, "checkDatatypeExpression", params);
    }

    /**
     * Creates a restriction
     * @param cls the subject class of the restriction
     * @param predicate
     * @param manchExpr manchester expression used to create restriction
     */
    createRestriction(cls: ARTURIResource, predicate: ARTURIResource, manchExpr: string) {
        var params = {
            classIri: cls,
            exprType: predicate,
            manchExpr: manchExpr
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
        var params = {
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
    updateExpression(newManchExpr: string, bnode: ARTBNode) {
        var params = {
            newManchExpr: newManchExpr,
            bnode: bnode
        };
        return this.httpMgr.doPost(this.serviceName, "updateExpression", params);
    }

    isClassAxiom(bnode: ARTBNode): Observable<boolean> {
        var params = {
            bnode: bnode
        };
        return this.httpMgr.doGet(this.serviceName, "isClassAxiom", params);
    }


}