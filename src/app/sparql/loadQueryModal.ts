import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ConfigurationsServices } from "../services/configurationsServices";
import { ConfigurationComponents, Reference } from "../models/Configuration";

// export class LoadQueryModalData extends BSModalContext {
//     constructor(public query: string, public inferred: boolean) {
//         super();
//     }
// }

@Component({
    selector: "load-query",
    templateUrl: "./loadQueryModal.html",
})
export class LoadQueryModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private references: Reference[];
    private selectedRef: Reference;

    constructor(public dialog: DialogRef<BSModalContext>, private configurationService: ConfigurationsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.initReferences();
    }

    private initReferences() {
        this.configurationService.getConfigurationReferences(ConfigurationComponents.SPARQL_STORE).subscribe(
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

    private getRefScope(reference: Reference) {
        if (reference.relativeReference.startsWith("sys:")) {
            return "SYSTEM";
        } else if (reference.relativeReference.startsWith("proj:")) {
            return "PROJECT";
        } else if (reference.relativeReference.startsWith("usr:")) {
            return "USER";
        } else if (reference.relativeReference.startsWith("pu:")) {
            return "PROJECT_USER";
        }
    }

    private deleteReference(reference: Reference) {
        this.configurationService.deleteConfiguration(ConfigurationComponents.SPARQL_STORE, reference.relativeReference).subscribe(
            stResp => {
                this.initReferences();
            }
        )
    }

    ok(event: Event) {
        this.configurationService.getConfiguration(ConfigurationComponents.SPARQL_STORE, this.selectedRef.relativeReference).subscribe(
            conf => {
                event.stopPropagation();
                this.dialog.close(conf);
            }
        )
    }

    cancel() {
        this.dialog.dismiss();
    }

}