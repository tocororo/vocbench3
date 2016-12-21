import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTNode, ARTURIResource, ARTPredicateObjects, ResAttribute} from "../../utils/ARTResources";
import {RDFS} from "../../utils/Vocabulary";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ModalServices} from "../../widget/modal/modalServices";
import {PropertyServices} from "../../services/propertyServices";
import {ManchesterServices} from "../../services/manchesterServices";

@Component({
	selector: "domains-renderer",
	templateUrl: "./predicateObjectListRenderer.html",
})
export class DomainsPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    private label = "Domains";
    private addBtnImgTitle = "Add a domain";
    private addBtnImgSrc = require("../../../assets/images/class_create.png");
    private removeBtnImgTitle = "Remove domain"; 
    
    constructor(private propService:PropertyServices, private manchService: ManchesterServices,
        private browsingService: BrowsingServices, private modalService: ModalServices) {}
    
    private addExistingClass() {
        this.browsingService.browseClassTree("Select a domain class").then(
            (selectedClass: any) => {
                this.propService.addPropertyDomain(this.resource, selectedClass).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }
    
    private addClassExpression() {
        this.modalService.prompt("Class Expression (Manchester Syntax)").then(
            (manchExpr: any) => {
                this.manchService.checkExpression(manchExpr).subscribe(
                    stResp => {
                        this.manchService.createRestriction(this.resource, RDFS.domain, manchExpr).subscribe(
                            stResp => this.update.emit(null)
                        );
                    }
                )
            },
            () => {}
        );
    }
    
    private remove(domain: ARTNode) {
        if (domain.isBNode()) {
            this.manchService.removeExpression(this.resource, RDFS.domain, domain).subscribe(
                stResp => this.update.emit(null)
            )
        } else {
            this.propService.removePropertyDomain(this.resource, <ARTURIResource>domain).subscribe(
                stResp => {
                    this.update.emit(null);
                }
            );
        }
    }
    
    private objectDblClick(obj: ARTResource) {
        //clicked object (domain class) can only be a URIResource or BNode
        this.dblclickObj.emit(<ARTResource>obj);
    }

    /**
     * Tells if the given object need to be rendered as reifiedResource or as simple rdfResource.
     * A resource should be rendered as reifiedResource if the predicate has custom range and the object
     * is an ARTBNode or an ARTURIResource (so a reifiable object). Otherwise, if the object is a literal
     * or the predicate has no custom range, the object should be rendered as simple rdfResource
     * @param object object of the predicate object list to render in view.
     */
    private renderAsReified(predicate: ARTURIResource, object: ARTNode) {
        return (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource());
    }

    private getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    private getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
}