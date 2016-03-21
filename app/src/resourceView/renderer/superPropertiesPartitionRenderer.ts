import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {PropertyServices} from "../../services/propertyServices";

@Component({
	selector: "superproperties-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [PropertyServices],
})
export class SuperPropertiesPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    private label = "Superproperties";
    private addBtnImgSrc = "app/assets/images/prop_create.png";
    private addBtnImgTitle = "Add a superproperty";
    private removeBtnImgSrc = "app/assets/images/prop_delete.png";
    private removeBtnImgTitle = "Remove superproperty";
    
    constructor(private propService:PropertyServices, private modalService: ModalServices,
        private browsingService: BrowsingServices) {}
    
    private add() {
        this.browsingService.browsePropertyTree("Select a super property").then(
            selectedProp => {
                this.propService.addSuperProperty(this.resource, selectedProp).subscribe(
                    stResp => this.update.emit(null) 
                );
            }
        );
    }
    
    private remove(superProp: ARTURIResource) {
        this.propService.removeSuperProperty(this.resource, superProp).subscribe(
            stResp => {
                this.update.emit(null);
            },
            err => { }
        );
    }
    
}