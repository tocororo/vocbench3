import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTNode, ARTURIResource} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {PropertyServices} from "../../services/propertyServices";

@Component({
	selector: "superproperties-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [BrowsingServices],
})
export class SuperPropertiesPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();
    
    private label = "Superproperties";
    private addBtnImgTitle = "Add a superproperty";
    private removeBtnImgTitle = "Remove superproperty";
    
    constructor(private propService:PropertyServices, private browsingService: BrowsingServices) {}
    
    private add() {
        this.browsingService.browsePropertyTree("Select a super property").then(
            selectedProp => {
                this.propService.addSuperProperty(this.resource, selectedProp).subscribe(
                    stResp => this.update.emit(null) 
                );
            },
            () => {}
        );
    }
    
    private remove(superProp: ARTURIResource) {
        this.propService.removeSuperProperty(this.resource, superProp).subscribe(
            stResp => {
                this.update.emit(null);
            }
        );
    }
    
    private objectDblClick(obj: ARTURIResource) {
        this.dblclickObj.emit(obj);//clicked object (superProp) can only be a URIResource
    }
    
}