import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { Decomp, RDF } from "../../../models/Vocabulary";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "rdfs-members-modal",
    templateUrl: "./rdfsMembersModal.html",
})
export class RdfsMembersModal {
    @Input() property: ARTURIResource;
    @Input() propChangeable: boolean = true;

    private constituentCls: ARTURIResource = Decomp.component;

    rootProperty: ARTURIResource; //root property of the partition that invoked this modal
    enrichingProperty: ARTURIResource;

    rdfN: ARTURIResource;
    memberN: number = 1;

    selectedConstituent: ARTURIResource;

    constructor(public activeModal: NgbActiveModal, private browsingModals: BrowsingModalServices) {}

    ngOnInit() {
        this.updateRdfNProp();

        this.rootProperty = this.property;
        this.enrichingProperty = this.rdfN;
    }

    private updateRdfNProp() {
        this.rdfN = new ARTURIResource(RDF.namespace + "_" + this.memberN, "rdf:_" + this.memberN, RDFResourceRolesEnum.objectProperty);
        this.enrichingProperty = this.rdfN;
    }

    changeProperty() {
        this.browsingModals.browsePropertyTree({key:"ACTIONS.SELECT_PROPERTY"}, [this.rootProperty]).then(
            (selectedProp: any) => {
                if (this.enrichingProperty.getURI() != selectedProp.getURI()) {
                    this.enrichingProperty = selectedProp;
                }
            },
            () => { }
        );
    }

    ok() {
        this.activeModal.close({property: this.enrichingProperty, value: this.selectedConstituent});
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export class RdfsMembersModalReturnData {
    property: ARTURIResource;
    value: ARTURIResource;
}
