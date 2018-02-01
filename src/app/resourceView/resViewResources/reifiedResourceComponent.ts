import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTNode, ARTResource, ARTURIResource, ARTPredicateObjects, ResAttribute} from "../../models/ARTResources";
import {CustomFormsServices} from "../../services/customFormsServices";

@Component({
	selector: "reified-resource",
	templateUrl: "./reifiedResourceComponent.html",
})
export class ReifiedResourceComponent {
    
    @Input() predicate: ARTURIResource;
    @Input() resource: ARTResource; //BNode or URIResource
    @Output() dblClick: EventEmitter<ARTResource> = new EventEmitter();
    
    private predicateObjectList: ARTPredicateObjects[];
    
    private open: boolean = false;
	
	constructor(private cfService: CustomFormsServices) {}
    
    private toggle() {
        if (this.predicateObjectList == null) {
            this.cfService.getGraphObjectDescription(this.predicate, this.resource).subscribe(
                graphDescr => {
                    this.predicateObjectList = graphDescr;
                    this.open = !this.open;
                }
            );
        } else {
            this.open = !this.open;
        }
    }
    
    private resourceDblClick() {
        this.dblClick.emit(this.resource);
    }

    private objectDblClick(object: ARTNode) {
        if (object.isResource()) {
            this.dblClick.emit(<ARTResource>object);
        }
    }

    /**
     * Tells if the resource should be rendered as reified resource (expandable).
     * The resource should be rendered as reified resource if it is still not open or it has been expanded
     * and it has a description.
     * If it has been expanded but it has no description it should be rendered as simple rdf-resource
     */
    private isExpandableResource() {
        if (!this.open || this.open && this.predicateObjectList) {
            return true;
        } else {
            setTimeout(() => {
                this.resource.setAdditionalProperty(ResAttribute.NOT_REIFIED, true);
            })
            return false;
        }
    }

}