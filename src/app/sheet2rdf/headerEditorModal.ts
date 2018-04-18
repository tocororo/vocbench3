import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../models/ARTResources";
import { ConverterContractDescription, ConverterUtils, RDFCapabilityType } from "../models/Coda";
import { Sheet2RDFServices } from "../services/sheet2rdfServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../widget/modal/browsingModal/browsingModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";

export class HeaderEditorModalData extends BSModalContext {
    /**
     * This modal get the headerId instead of directly the HeaderStruct in order to prevent changes directly on the HeaderStruct
     * (even if the user discard the modal)
     * @param headerId 
     */
    constructor(public headerId: string, public first: boolean = false) {
        super();
    }
}

@Component({
    selector: "header-editor-modal",
    templateUrl: "./headerEditorModal.html",
})
export class HeaderEditorModal implements ModalComponent<HeaderEditorModalData> {
    context: HeaderEditorModalData;

    // private header: HeaderStruct;

    private headerName: string;
    private headerId: string;
    private headerResource: ARTURIResource;

    private converterType: RDFCapabilityType;
    private converterUri: string;
    private converterQName: string;

    private multiple: boolean;

    constructor(public dialog: DialogRef<HeaderEditorModalData>, private s2rdfService: Sheet2RDFServices,
        private basicModals: BasicModalServices, private browingModals: BrowsingModalServices, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.s2rdfService.getHeaderFromId(this.context.headerId).subscribe(
            header => {
                this.headerName = header.name;
                this.headerId = header.id;
                this.headerResource = header.resource;
                this.converterType = header.converter.type;
                this.converterUri = header.converter.uri;
                if (this.converterUri != null) {
                    this.converterQName = ConverterUtils.getConverterQName(this.converterUri);
                }
                this.multiple = header.isMultiple;
            }
        );
    }

    private browseProperty() {
        this.browingModals.browsePropertyTree("Select property").then(
            (property: ARTURIResource) => {
                this.headerResource = property;
            },
            () => {}
        )
    }

    private browseClass() {
        this.browingModals.browseClassTree("Select class").then(
            (cls: ARTURIResource) => {
                this.headerResource = cls;
            },
            () => {}
        )
    }

    private chooseConverter() {
        this.sharedModals.selectConverter("Select converter").then(
            (converter: {projectionOperator: string, contractDesctiption: ConverterContractDescription }) => {
                let capabilityType: RDFCapabilityType = converter.contractDesctiption.getRDFCapability();
                if (capabilityType == RDFCapabilityType.uri) {
                    this.converterType = RDFCapabilityType.uri;
                } else if (capabilityType == RDFCapabilityType.typedLiteral || capabilityType == RDFCapabilityType.literal) {
                    this.converterType = RDFCapabilityType.literal;
                } else if (capabilityType == RDFCapabilityType.node) {
                    this.converterType = converter.projectionOperator.startsWith('uri') ? RDFCapabilityType.uri : RDFCapabilityType.literal;
                }
                this.converterUri = converter.contractDesctiption.getURI();
                this.converterQName = ConverterUtils.getConverterQName(this.converterUri);
            },
            () => {}
        )
    }

    ok(event: Event) {
        if (this.multiple) {
            this.basicModals.confirm("Edit header", "There are multiple header with the same name (" + this.headerName 
                + "). Do you want to apply the same changes to all of them?", "warning").then(
                (confirm: any) => {
                    this.updateHeader(true);
                },
                () => {
                    this.updateHeader(false);
                }
            )
        } else {
            this.updateHeader();
        }
        event.stopPropagation();
    }

    private updateHeader(applyToAll?: boolean) {
        this.s2rdfService.updateHeader(this.headerId, this.headerResource, this.converterQName, this.converterType, applyToAll).subscribe(
            stResp => {
                this.dialog.close();
            }
        )
    }

    cancel() {
        this.dialog.dismiss();
    }

}