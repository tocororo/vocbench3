import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CODAConverter } from "src/app/models/Sheet2RDF";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";

@Component({
    selector: "graph-entry-point-modal",
    templateUrl: "./graphEntryPointModal.html",
})
export class GraphEntryPointModal {

    @Input() converter: CODAConverter;

    converterStatus: ConverterConfigStatus;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() { }

    onConverterUpdate(converterStatus: ConverterConfigStatus) {
        this.converterStatus = converterStatus;
    }

    isOkEnabled(): boolean {
        return this.converterStatus != null && CODAConverter.isSignatureOk(this.converterStatus.converter);
    }

    ok() {
        this.activeModal.close(this.converterStatus);
    }

    cancel() {
        this.activeModal.dismiss();
    }
}