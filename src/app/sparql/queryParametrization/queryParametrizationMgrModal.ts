import { Component } from "@angular/core";
import { DialogRef, ModalComponent, OverlayConfig, Modal } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents, Reference, Configuration } from "../../models/Configuration";
import { ConfigurationsServices } from "../../services/configurationsServices";
import { QueryParametrizerModalData, QueryParametrizerModal } from "./queryParametrizerModal";

@Component({
    selector: "query-param-mgr-modal",
    templateUrl: "./queryParametrizationMgrModal.html",
})
export class QueryParametrizationMgrModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private confComponentId: string = ConfigurationComponents.SPARQL_PARAMETRIZATION_STORE;

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

    private createParametrization() {
        this.openQueryParametrizationModal().then(
            () => {
                this.initReferences();
            }
        );
    }

    private editReference(reference: Reference) {
        this.openQueryParametrizationModal(reference);
    }

    private deleteReference(reference: Reference) {
        this.configurationService.deleteConfiguration(this.confComponentId, reference.relativeReference).subscribe(
            stResp => {
                this.selectedRef = null;
                this.initReferences();
            }
        );
    }

    private openQueryParametrizationModal(reference?: Reference) {
        let relativeReference: string = (reference != null) ? reference.relativeReference : null;
        var modalData = new QueryParametrizerModalData(relativeReference);
        const builder = new BSModalContextBuilder<QueryParametrizerModalData>(
            modalData, undefined, QueryParametrizerModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).size('lg').toJSON() };
        return this.modal.open(QueryParametrizerModal, overlayConfig).result;
    }


    ok(event: Event) {
        this.configurationService.getConfiguration(this.confComponentId, this.selectedRef.relativeReference).subscribe(
            conf => {
                let returnData: QueryParametrizationMgrModalReturnData = {
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

export class QueryParametrizationMgrModalReturnData {
    configuration: Configuration;
    relativeReference: string;
}