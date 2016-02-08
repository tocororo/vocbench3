import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
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
    
    public label = "Domains";
    public addBtnImgSrc = "app/assets/images/class_create.png";
    public addBtnImgTitle = "Add a domain";
    public removeBtnImgSrc = "app/assets/images/class_delete.png";
    public removeBtnImgTitle = "Remove domain";
    
    constructor(private propService:PropertyServices) {}
    
    public add() {
        alert("add domain to " + this.resource.getShow());
        this.update.emit(null);
    }
    
    public remove(domain: ARTURIResource) {
        this.propService.removePropertyDomain(this.resource.getURI(), domain.getURI())
            .subscribe(
                stResp => {
                    this.update.emit(null);
                },
                err => {
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
}