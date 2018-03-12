import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ConfigurationsServices } from "../services/configurationsServices";
import { ConfigurationComponents, Reference } from "../models/Configuration";

export class SaveQueryModalData extends BSModalContext {
    constructor(public query: string, public type: string, public includeInferred: boolean) {
        super();
    }
}

@Component({
    selector: "save-query",
    templateUrl: "./saveQueryModal.html",
})
export class SaveQueryModal implements ModalComponent<SaveQueryModalData> {
    context: SaveQueryModalData;

    private scopes: string[];
    private selectedScope: string;

    private identifier: string;

    constructor(public dialog: DialogRef<SaveQueryModalData>, private configurationsService: ConfigurationsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.configurationsService.getConfigurationManager(ConfigurationComponents.SPARQL_STORE).subscribe(
            confMgr => {
                this.scopes = confMgr.configurationScopes;
                this.selectedScope = this.scopes[0];
            }
        )
    }

    ok(event: Event) {
        let queryConfig: any = {
            sparql: this.context.query,
            type: this.context.type,
            includeInferred: this.context.includeInferred+""
        }

        //this is strange: I get the configuration scopes from the server but I need to hardwire the convertion to the serialization for the relativeReference
        let scopeSerialization: string;
        if (this.selectedScope == "SYSTEM") {
            scopeSerialization = "sys";
        } else if (this.selectedScope == "PROJECT") {
            scopeSerialization = "proj";
        } else if (this.selectedScope == "USER") {
            scopeSerialization = "usr";
        } else {
            scopeSerialization = "pu";
        }

        let relativeReference: string = scopeSerialization + ":" + this.identifier;

        this.configurationsService.storeConfiguration(ConfigurationComponents.SPARQL_STORE, relativeReference, queryConfig).subscribe(
            stResp => {
                event.stopPropagation();
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}