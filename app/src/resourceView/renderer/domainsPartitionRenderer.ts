import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
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
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    private label = "Domains";
    private addBtnImgSrc = "app/assets/images/class_create.png";
    private addBtnImgTitle = "Add a domain";
    private removeBtnImgSrc = "app/assets/images/class_delete.png";
    private removeBtnImgTitle = "Remove domain";
    
    constructor(private propService:PropertyServices, private browsingService: BrowsingServices) {}
    
    private add() {
        this.browsingService.browseClassTree("Select a domain class").then(
            selectedClass => {
                this.propService.addPropertyDomain(this.resource, selectedClass).subscribe(
                    stResp => this.update.emit(null)
                );
            }
        );
    }
    
    private remove(domain: ARTURIResource) {
        this.propService.removePropertyDomain(this.resource, domain).subscribe(
            stResp => {
                this.update.emit(null);
            },
            err => { }
        );
    }
    
}