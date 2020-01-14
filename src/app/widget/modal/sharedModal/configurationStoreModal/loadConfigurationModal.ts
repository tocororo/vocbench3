import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Configuration, Reference } from "../../../../models/Configuration";
import { ConfigurationsServices } from "../../../../services/configurationsServices";

export class LoadConfigurationModalData extends BSModalContext {
    /**
     * @param title 
     * @param configurationComponent 
     * @param allowLoad 
     *      if true (default), the dialog loads and returns the selected configuration;
     *      if false just returns the selected configuration without loading it.
     * @param allowDelete
     *      if true (default) the UI provides buttons for deleting the configuration;
     *      if false the deletion of the configuration is disabled.
     * @param additionalReferences additional references not deletable. 
     *  If one of these references is chosen, it is just returned, its configuration is not loaded
     */
    constructor(
        public title: string, 
        public configurationComponent: string,
        public allowLoad: boolean = true,
        public allowDelete: boolean = true,
        public additionalReferences: Reference[]
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
        if (!this.context.allowLoad) {
            let returnData: LoadConfigurationModalReturnData = {
                configuration: null,
                reference: this.selectedRef
            }
            this.dialog.close(returnData);
        } else {
            //selected reference is from the additionals => do not load the configuration, but let handling it to the component that opened the modal
            if (this.context.additionalReferences != null && this.context.additionalReferences.indexOf(this.selectedRef) != -1) {
                let returnData: LoadConfigurationModalReturnData = {
                    configuration: null,
                    reference: this.selectedRef
                }
                this.dialog.close(returnData);
            } else {
                this.configurationService.getConfiguration(this.context.configurationComponent, this.selectedRef.relativeReference).subscribe(
                    conf => {
                        let returnData: LoadConfigurationModalReturnData = {
                            configuration: conf,
                            reference: this.selectedRef
                        }
                        this.dialog.close(returnData);
                    }
                );
            }
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}


export class LoadConfigurationModalReturnData {
    configuration: Configuration;
    reference: Reference;
}