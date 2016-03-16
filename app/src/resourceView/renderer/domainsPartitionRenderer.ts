import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {PropertyServices} from "../../services/propertyServices";

@Component({
	selector: "domains-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [PropertyServices],
})
export class DomainsPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();
    
    private label = "Domains";
    private addBtnImgSrc = "app/assets/images/class_create.png";
    private addBtnImgTitle = "Add a domain";
    private removeBtnImgSrc = "app/assets/images/class_delete.png";
    private removeBtnImgTitle = "Remove domain";
    
    constructor(private propService:PropertyServices, private modalService: ModalServices) {}
    
    private add() {
        alert("add domain to " + this.resource.getShow());
        this.update.emit(null);
    }
    
    private remove(domain: ARTURIResource) {
        this.propService.removePropertyDomain(this.resource, domain).subscribe(
            stResp => {
                this.update.emit(null);
            },
            err => {
                this.modalService.alert("Error", err, "error");
                console.error(err.stack);
            }
        );
    }
    
}