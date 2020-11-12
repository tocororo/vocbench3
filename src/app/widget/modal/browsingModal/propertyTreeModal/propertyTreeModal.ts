import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource, RDFResourceRolesEnum } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext } from "../../../../utils/VBContext";

@Component({
    selector: "property-tree-modal",
    templateUrl: "./propertyTreeModal.html",
})
export class PropertyTreeModal {
    @Input() title: string;
    @Input() rootProperties: ARTURIResource[];
    @Input() resource: ARTURIResource;
    @Input() type: RDFResourceRolesEnum;
    @Input() projectCtx?: ProjectContext;
    
    selectedProperty: ARTURIResource;
    domainRes: ARTURIResource;

    private showAll: boolean = false;
    
    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}
    
    ngOnInit() {
        this.domainRes = this.resource;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }
    
    onPropertySelected(property: ARTURIResource) {
        this.selectedProperty = property;
    }
    
    /**
     * When the checkbox "select all properties" changes status
     * Resets the selectedProperty and update the domainRes that represents 
     * the resource which its type should be the domain of the properties in the tree
     */
    onShowAllChanged() {
        this.selectedProperty = null;
        if (this.showAll) {
            this.domainRes = null;
        } else {
            this.domainRes = this.resource;
        }
    }

    ok() {
        this.activeModal.close(this.selectedProperty);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
}