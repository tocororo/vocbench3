import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Configuration, Reference } from "../../../../models/Configuration";
import { ConfigurationsServices } from "../../../../services/configurationsServices";

@Component({
    selector: "load-configuration",
    templateUrl: "./loadConfigurationModal.html",
})
export class LoadConfigurationModal {
    @Input() title: string;
    @Input() configurationComponent: string;
    @Input() allowLoad: boolean = true;
    @Input() allowDelete: boolean = true;
    @Input() additionalReferences: Reference[];

    references: Reference[];
    selectedRef: Reference;

    constructor(public activeModal: NgbActiveModal, private configurationService: ConfigurationsServices) {}

    ngOnInit() {
        this.initReferences();
    }

    private initReferences() {
        this.configurationService.getConfigurationReferences(this.configurationComponent).subscribe(
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

    private deleteReference(reference: Reference) {
        this.configurationService.deleteConfiguration(this.configurationComponent, reference.relativeReference).subscribe(
            stResp => {
                this.selectedRef = null;
                this.initReferences();
            }
        );
    }

    ok() {
        if (!this.allowLoad) {
            let returnData: LoadConfigurationModalReturnData = {
                configuration: null,
                reference: this.selectedRef
            };
            this.activeModal.close(returnData);
        } else {
            //selected reference is from the additionals => do not load the configuration, but let handling it to the component that opened the modal
            if (this.additionalReferences != null && this.additionalReferences.indexOf(this.selectedRef) != -1) {
                let returnData: LoadConfigurationModalReturnData = {
                    configuration: null,
                    reference: this.selectedRef
                };
                this.activeModal.close(returnData);
            } else {
                this.configurationService.getConfiguration(this.configurationComponent, this.selectedRef.relativeReference).subscribe(
                    conf => {
                        let returnData: LoadConfigurationModalReturnData = {
                            configuration: conf,
                            reference: this.selectedRef
                        };
                        this.activeModal.close(returnData);
                    }
                );
            }
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}


export class LoadConfigurationModalReturnData {
    configuration: Configuration;
    reference: Reference;
}