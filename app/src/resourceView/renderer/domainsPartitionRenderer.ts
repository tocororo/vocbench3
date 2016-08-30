import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTNode, ARTURIResource} from "../../utils/ARTResources";
import {RDFS} from "../../utils/Vocabulary";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ModalServices} from "../../widget/modal/modalServices";
import {PropertyServices} from "../../services/propertyServices";
import {ManchesterServices} from "../../services/manchesterServices";

@Component({
	selector: "domains-renderer",
	templateUrl: "app/src/resourceView/renderer/domainsPartitionRenderer.html",
	directives: [RdfResourceComponent],
    providers: [BrowsingServices],
})
export class DomainsPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    
    constructor(private propService:PropertyServices, private manchService: ManchesterServices,
        private browsingService: BrowsingServices, private modalService: ModalServices) {}
    
    private addExistingClass() {
        this.browsingService.browseClassTree("Select a domain class").then(
            selectedClass => {
                this.propService.addPropertyDomain(this.resource, selectedClass).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }
    
    private addClassExpression() {
        this.modalService.prompt("Class Expression (Manchester Syntax)").then(
            manchExpr => {
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
    
}