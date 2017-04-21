import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {ARTURIResource, ARTNode, ARTBNode} from "../models/ARTResources";

@Injectable()
export class ManchesterServices {

    private serviceName = "ManchesterHandler";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }
    
    /**
     * Checks if a manchester expression in valid
     * @param manchExpr manchester expression to check
     */
    checkExpression(manchExpr: string) {
        console.log("[ManchesterServices] checkExpression");
        var params = {
            manchExpr: manchExpr
        };
        return this.httpMgr.doGet(this.serviceName, "checkExpression", params, this.oldTypeService, true);
    }

    /**
     * Creates a restriction
     * @param cls the subject class of the restriction
     * @param predicate
     * @param manchExpr manchester expression used to create restriction
     */
    createRestriction(cls: ARTURIResource, predicate: ARTURIResource, manchExpr: string) {
        console.log("[ManchesterServices] createRestriction");
        var params = {
            classIri: cls,
            exprType: predicate,
            manchExpr: manchExpr
        };
        return this.httpMgr.doGet(this.serviceName, "createRestriction", params, this.oldTypeService, true);
    }
    
    /**
     * Removes a restriction
     * @param cls the subject class of the restriction
     * @param predicate
     * @param manchExpr manchester expression to check
     */
    removeExpression(cls: ARTURIResource, predicate: ARTURIResource, bnode: ARTNode) {
        console.log("[ManchesterServices] removeExpression");
        var params = {
            classIri: cls,
            exprType: predicate,
            bnode: bnode
        };
        return this.httpMgr.doGet(this.serviceName, "removeExpression", params, this.oldTypeService, true);
    }

    /**
     * Updates a restrinction expressed by a manchester expression
     * @param newManchExpr 
     * @param bnode bnode that represents the restriction
     */
    updateExpression(newManchExpr: string, bnode: ARTBNode) {
        console.log("[ManchesterServices] updateExpression");
        var params = {
            newManchExpr: newManchExpr,
            bnode: bnode
        };
        return this.httpMgr.doGet(this.serviceName, "updateExpression", params, this.oldTypeService, true);
    }
    

}