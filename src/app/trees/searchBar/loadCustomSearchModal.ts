import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents, Reference } from "../../models/Configuration";
import { Scope, Settings } from "../../models/Plugins";
import { SettingsServices } from "../../services/settingsServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { LoadConfigurationModalReturnData } from "../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "load-custom-search",
    templateUrl: "./loadCustomSearchModal.html",
})
export class LoadCustomSearchModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private scopes: Scope[];
    private selectedScope: Scope;

    private settings: Settings;

    private references: Reference[];
    private selectedRef: Reference;

    constructor(public dialog: DialogRef<BSModalContext>, private settingsService: SettingsServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.settingsService.getSettingsScopes(ConfigurationComponents.CUSTOM_SEARCH_STORE).subscribe(
            scopes => {
                this.scopes = scopes;
                this.selectedScope = this.scopes[0];
                this.initReferences();
            }
        )
    }

    private initReferences() {
        this.settingsService.getSettings(ConfigurationComponents.CUSTOM_SEARCH_STORE, this.selectedScope).subscribe(
            settings => {
                this.settings = settings;
                this.references = [];
                this.selectedRef = null;
                this.settings.properties.forEach(p => {
                    if (p.name == "searchSPARQLParameterizationReferences") {
                        let refs: string[] = p.value;
                        refs.forEach(r => {
                            let scope: Scope = Reference.getRelativeReferenceScope(r.substring(0, r.indexOf(":")));
                            let id = r.substring(r.indexOf(":")+1);
                            this.references.push(new Reference(null, null, id, r)); //project and user null, they are not necessary
                        });
                    }
                })
            }
        );
    }

    private add() {
        this.sharedModals.loadConfiguration("Select stored parameterized SPARQL query", ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE, false, false).then(
            (data: LoadConfigurationModalReturnData) => {
                let ref: string = data.reference.relativeReference;
                let alreadyIn: boolean = false;
                this.references.forEach(r => {
                    if (r.relativeReference == ref) {
                        alreadyIn = true;
                    }
                });
                if (alreadyIn) {
                    this.basicModals.alert("Duplicated Custom Search", "The stored parameterized SPARQL query '" + ref + 
                        "' is already in the Stored Custom Search list. It will not be added", "warning");
                    return;
                }

                //update the setting
                let updatedPropValue: string[] = [];
                this.references.forEach(ref => {
                    updatedPropValue.push(ref.relativeReference);
                });
                updatedPropValue.push(ref);
                this.settings.properties.forEach(p => {
                    if (p.name == "searchSPARQLParameterizationReferences") {
                        p.value = updatedPropValue;
                    }
                });
                //store the updated settings
                this.settingsService.storeSettings(ConfigurationComponents.CUSTOM_SEARCH_STORE, this.selectedScope, this.settings.getPropertiesAsMap()).subscribe(
                    stResp => {
                        this.initReferences(); //refresh the references
                    }
                );
            },
            () => {}
        )
    }

    private selectReference(reference: Reference) {
        if (this.selectedRef == reference) {
            this.selectedRef = null;
        } else {
            this.selectedRef = reference;
        }
    }

    private deleteReference(reference: Reference) {
        //update the setting
        let updatedPropValue: string[] = [];
        this.references.forEach(ref => {
            if (ref != reference) { //omits the reference to delete
                updatedPropValue.push(ref.relativeReference);
            }
        });
        this.settings.properties.forEach(p => {
            if (p.name == "searchSPARQLParameterizationReferences") {
                p.value = updatedPropValue;
            }
        });
        //store the updated settings
        this.settingsService.storeSettings(ConfigurationComponents.CUSTOM_SEARCH_STORE, this.selectedScope, this.settings.getPropertiesAsMap()).subscribe(
            stResp => {
                this.initReferences(); //refresh the references
            }
        );
    }

    ok(event: Event) {
        this.dialog.close(this.selectedRef.relativeReference);
    }

    cancel() {
        this.dialog.dismiss();
    }

}