import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Reference } from "../../../../models/Configuration";
import { Scope, ScopeUtils } from "../../../../models/Plugins";
import { ConfigurationsServices } from "../../../../services/configurationsServices";

export class StoreConfigurationModalData extends BSModalContext {
    constructor(
        public title: string, 
        public configurationComponent: string,
        public configurationObject: { [key: string]: any },
        public relativeRef: string
    ) {
        super();
    }
}

@Component({
    selector: "store-configuration",
    templateUrl: "./storeConfigurationModal.html",
})
export class StoreConfigurationModal implements ModalComponent<StoreConfigurationModalData> {
    context: StoreConfigurationModalData;

    private scopes: Scope[];
    private selectedScope: Scope;

    private identifier: string;

    constructor(public dialog: DialogRef<StoreConfigurationModalData>, private configurationsService: ConfigurationsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.configurationsService.getConfigurationManager(this.context.configurationComponent).subscribe(
            confMgr => {
                this.scopes = confMgr.configurationScopes;
                this.selectedScope = this.scopes[0];

                if (this.context.relativeRef) {
                    this.identifier = this.context.relativeRef.substring(this.context.relativeRef.indexOf(":")+1);
                    this.selectedScope = Reference.getRelativeReferenceScope(this.context.relativeRef);
                }
            }
        )
    }

    ok(event: Event) {
        //this is strange: I get the configuration scopes from the server but I need to hardwire the convertion to the serialization for the relativeReference
        let scopeSerialization: string = ScopeUtils.serializeScope(<Scope>this.selectedScope);
        let relativeReference: string = scopeSerialization + ":" + this.identifier;

        this.configurationsService.storeConfiguration(this.context.configurationComponent, relativeReference, this.context.configurationObject).subscribe(
            stResp => {
                event.stopPropagation();
                this.dialog.close(relativeReference);
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}