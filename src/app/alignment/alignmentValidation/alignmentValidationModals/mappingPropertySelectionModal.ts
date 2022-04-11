import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../../../models/ARTResources";
import { AlignmentServices } from "../../../services/alignmentServices";

@Component({
    selector: "mapping-prop-select-modal",
    templateUrl: "./mappingPropertySelectionModal.html",
})
export class MappingPropertySelectionModal {
    @Input() title: string;
    @Input() message: string; 
    @Input() resource: ARTURIResource;

    mappingPropList: ARTURIResource[];
    selectedProperty: ARTURIResource;
    setAsDefault: boolean = true;
    allPropCheck: boolean = false;

    constructor(public activeModal: NgbActiveModal, private alignmentService: AlignmentServices) {}

    ngOnInit() {
        this.initMappingProperties();
    }

    initMappingProperties() {
        //get from server list of mapping properties
        this.alignmentService.getMappingProperties(this.resource.getRole(), this.allPropCheck).subscribe(
            props => {
                this.mappingPropList = props;
                if (this.selectedProperty != null) {
                    this.selectedProperty = this.mappingPropList.find(p => p.equals(this.selectedProperty));
                }
            }
        );
    }

    ok() {
        let returnData: { property: ARTURIResource, setAsDefault: boolean } = { 
            property: this.selectedProperty, setAsDefault: this.setAsDefault 
        };
        this.activeModal.close(returnData);
    }

    cancel() {
        this.activeModal.dismiss();
    }
}