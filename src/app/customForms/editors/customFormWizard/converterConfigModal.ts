import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "src/app/models/ARTResources";
import { CODAConverter } from "src/app/models/Sheet2RDF";
import { RangeType } from "src/app/services/propertyServices";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";

@Component({
    selector: "converter-config-modal",
    templateUrl: "./converterConfigModal.html",
})
export class ConverterConfigModal {

    @Input() converter: CODAConverter; //converter to restore, with params, language, datatype...
    @Input() rangeType: RangeType; //restrict the converters to those which capability is compliant (if not provided, all converter are listed)
    @Input() language: string; //restrict/force the selection of language for literal converters
    @Input() datatype: ARTURIResource; //restrict/force the selection of datatype for literal converters

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