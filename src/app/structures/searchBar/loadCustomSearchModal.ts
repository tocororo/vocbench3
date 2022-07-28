import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchServices } from 'src/app/services/searchServices';
import { ModalType } from 'src/app/widget/modal/Modals';
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
export class LoadCustomSearchModal {

    scopes: Scope[];
    selectedScope: Scope;

    private settings: Settings;

    references: Reference[];
    selectedRef: Reference;

    constructor(public activeModal: NgbActiveModal, private settingsService: SettingsServices, private searchService: SearchServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.settingsService.getSettingsScopes(ConfigurationComponents.CUSTOM_SEARCH_STORE).subscribe(
            scopes => {
                this.scopes = scopes;
                this.selectedScope = this.scopes[0];
                this.initReferences();
            }
        );
    }

    initReferences() {
        this.searchService.getCustomSearchSettings(this.selectedScope).subscribe(
            settings => {
                this.settings = settings;
                this.references = [];
                this.selectedRef = null;
                this.settings.properties.forEach(p => {
                    if (p.name == "searchSPARQLParameterizationReferences") {
                        let refs: string[] = p.value;
                        if (refs != null) {
                            refs.forEach(r => {
                                let id = r.substring(r.indexOf(":") + 1);
                                this.references.push(new Reference(null, null, id, r)); //project and user null, they are not necessary
                            });
                        }
                    }
                });
            }
        );
    }

    add() {
        this.sharedModals.loadConfiguration({ key: "SPARQL.ACTIONS.SELECT_STORED_SPARQL_PARAMETERIZED_QUERY" }, ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE, false, false).then(
            (data: LoadConfigurationModalReturnData) => {
                let ref: string = data.reference.relativeReference;
                let alreadyIn: boolean = false;
                this.references.forEach(r => {
                    if (r.relativeReference == ref) {
                        alreadyIn = true;
                    }
                });
                if (alreadyIn) {
                    this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.STORED_PARAMETERIZED_QUERY_ALREADY_ADDED", params: { ref: ref } }, ModalType.warning);
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
                this.searchService.storeCustomSearchSettings(this.selectedScope, this.settings.getPropertiesAsMap()).subscribe(
                    stResp => {
                        this.initReferences(); //refresh the references
                    }
                );
            },
            () => { }
        );
    }

    selectReference(reference: Reference) {
        if (this.selectedRef == reference) {
            this.selectedRef = null;
        } else {
            this.selectedRef = reference;
        }
    }

    deleteReference(reference: Reference) {
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
        this.searchService.storeCustomSearchSettings(this.selectedScope, this.settings.getPropertiesAsMap()).subscribe(
            stResp => {
                this.initReferences(); //refresh the references
            }
        );
    }

    ok() {
        this.activeModal.close(this.selectedRef.relativeReference);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}