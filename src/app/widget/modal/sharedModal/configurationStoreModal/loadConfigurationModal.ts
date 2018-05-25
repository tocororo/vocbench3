import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Configuration, Reference } from "../../../../models/Configuration";
import { ConfigurationsServices } from "../../../../services/configurationsServices";

export class LoadConfigurationModalData extends BSModalContext {
    constructor(
        public title: string, 
        public configurationComponent: string
    ) {
        super();
    }
}

@Component({
    selector: "load-configuration",
    templateUrl: "./loadConfigurationModal.html",
})
export class LoadConfigurationModal implements ModalComponent<LoadConfigurationModalData> {
    context: LoadConfigurationModalData;

    private references: Reference[];
    private selectedRef: Reference;

    constructor(public dialog: DialogRef<LoadConfigurationModalData>, private configurationService: ConfigurationsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.initReferences();
    }

    private initReferences() {
        this.configurationService.getConfigurationReferences(this.context.configurationComponent).subscribe(
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
        this.configurationService.deleteConfiguration(this.context.configurationComponent, reference.relativeReference).subscribe(
            stResp => {
                this.selectedRef = null;
                this.initReferences();
            }
        )
    }

    ok(event: Event) {
        this.configurationService.getConfiguration(this.context.configurationComponent, this.selectedRef.relativeReference).subscribe(
            conf => {
                event.stopPropagation();
                let returnData: LoadConfigurationModalReturnData = {
                    configuration: conf,
                    relativeReference: this.selectedRef.relativeReference
                }
                this.dialog.close(returnData);
            }
        )
    }

    cancel() {
        this.dialog.dismiss();
    }

}


export class LoadConfigurationModalReturnData {
    configuration: Configuration;
    relativeReference: string;
}