import { Component } from "@angular/core";
import { DialogRef, ModalComponent, OverlayConfig, Modal } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents, Reference, Configuration } from "../../models/Configuration";
import { ConfigurationsServices } from "../../services/configurationsServices";
import { QueryParameterizerModalData, QueryParameterizerModal } from "./queryParameterizerModal";

@Component({
    selector: "query-param-mgr-modal",
    templateUrl: "./queryParameterizationMgrModal.html",
})
export class QueryParameterizationMgrModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private confComponentId: string = ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE;

    private references: Reference[];
    private selectedRef: Reference;

    constructor(public dialog: DialogRef<BSModalContext>, private modal: Modal, private configurationService: ConfigurationsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.initReferences();
    }

    private initReferences() {
        this.configurationService.getConfigurationReferences(this.confComponentId).subscribe(
            refs => {
                this.references = refs;
            }
        );
    }

    private selectReference(reference: Reference) {
        if (this.selectedRef == reference) {
            this.selectedRef = null;
        } else {
            this.selectedRef = reference;
        }
    }

    private createParameterization() {
        this.openQueryParameterizationModal().then(
            () => {
                this.initReferences();
            },
            () => {}
        );
    }

    private editReference(reference: Reference) {
        this.openQueryParameterizationModal(reference);
    }

    private deleteReference(reference: Reference) {
        this.configurationService.deleteConfiguration(this.confComponentId, reference.relativeReference).subscribe(
            stResp => {
                this.selectedRef = null;
                this.initReferences();
            }
        );
    }

    private openQueryParameterizationModal(reference?: Reference) {
        let relativeReference: string = (reference != null) ? reference.relativeReference : null;
        var modalData = new QueryParameterizerModalData(relativeReference);
        const builder = new BSModalContextBuilder<QueryParameterizerModalData>(
            modalData, undefined, QueryParameterizerModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).size('lg').toJSON() };
        return this.modal.open(QueryParameterizerModal, overlayConfig).result;
    }


    ok(event: Event) {
        this.configurationService.getConfiguration(this.confComponentId, this.selectedRef.relativeReference).subscribe(
            conf => {
                let returnData: QueryParameterizationMgrModalReturnData = {
                    configuration: conf,
                    relativeReference: this.selectedRef.relativeReference
                }
                event.preventDefault();
                event.stopPropagation();
                this.dialog.close(returnData);
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class QueryParameterizationMgrModalReturnData {
    configuration: Configuration;
    relativeReference: string;
}