import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { Decomp, RDF } from "../../../models/Vocabulary";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";

export class RdfsMembersModalData extends BSModalContext {
    constructor(
        public property: ARTURIResource,
        public propChangeable: boolean = true
    ) {
        super();
    }
}

@Component({
    selector: "rdfs-members-modal",
    templateUrl: "./rdfsMembersModal.html",
})
export class RdfsMembersModal implements ModalComponent<RdfsMembersModalData> {
    context: RdfsMembersModalData;

    private constituentCls: ARTURIResource = Decomp.component;

    private rootProperty: ARTURIResource; //root property of the partition that invoked this modal
    private enrichingProperty: ARTURIResource;

    private rdfN: ARTURIResource;
    private memberN: number = 1;

    private selectedConstituent: ARTURIResource;

    constructor(public dialog: DialogRef<RdfsMembersModalData>, private browsingModals: BrowsingModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.updateRdfNProp();

        this.rootProperty = this.context.property;
        this.enrichingProperty = this.rdfN;
    }

    private updateRdfNProp() {
        this.rdfN = new ARTURIResource(RDF.namespace + "_" + this.memberN, "rdf:_" + this.memberN, RDFResourceRolesEnum.objectProperty);
        this.enrichingProperty = this.rdfN;
    }

    private changeProperty() {
        this.browsingModals.browsePropertyTree("Select a property", [this.rootProperty]).then(
            (selectedProp: any) => {
                if (this.enrichingProperty.getURI() != selectedProp.getURI()) {
                    this.enrichingProperty = selectedProp;
                }
            },
            () => { }
        );
    }

    ok(event: Event) {
        this.dialog.close({property: this.enrichingProperty, value: this.selectedConstituent});
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class RdfsMembersModalReturnData {
    property: ARTURIResource;
    value: ARTURIResource;
}
