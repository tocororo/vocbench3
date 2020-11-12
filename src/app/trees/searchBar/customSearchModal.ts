import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTNode } from "../../models/ARTResources";
import { Configuration, ConfigurationComponents, ConfigurationProperty } from "../../models/Configuration";
import { SettingsProp } from "../../models/Plugins";
import { BindingTypeEnum, VariableBindings } from "../../models/Sparql";
import { ConfigurationsServices } from "../../services/configurationsServices";
import { SearchServices } from "../../services/searchServices";
import { YasguiComponent } from "../../sparql/yasguiComponent";
import { ResourceUtils, SortAttribute } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "custom-search-modal",
    templateUrl: "./customSearchModal.html"
})
export class CustomSearchModal {
    @Input() searchParameterizationReference: string

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;
    @ViewChild(YasguiComponent) viewChildYasgui: YasguiComponent;

    parameterization: VariableBindings;
    private bindingsMap: Map<string, ARTNode>;

    staticParameterization: boolean = true; //tells if the parameterization has only assigned values (no parameters to bind). Useful in UI.

    private query: string;
    private inferred: boolean = false;

    description: string;

    detailsOn: boolean = false;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices,
        private configurationService: ConfigurationsServices, private searchService: SearchServices) {}

    ngOnInit() {
        this.configurationService.getConfiguration(ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE, this.searchParameterizationReference).subscribe(
            (configuration: Configuration) => {
                /**
                 * configuration contains 3 props:
                 * "relativeReference": the reference of the query
                 * "variableBindings": the map of the bindings parameterization
                 * "description": description of the parameterized query
                 */
                let properties: SettingsProp[] = configuration.properties;
                for (var i = 0; i < properties.length; i++) {
                    if (properties[i].name == "relativeReference") {
                        let storedQueryReference: string = properties[i].value;
                        if (storedQueryReference == null) {
                            this.basicModals.alert("Missing SPARQL query", "The stored SPARQL query referenced by the selected custom search does not exist anymore.", ModalType.warning);
                            this.cancel();
                            return;
                        }
                        //load query
                        this.configurationService.getConfiguration(ConfigurationComponents.SPARQL_STORE, storedQueryReference).subscribe(
                            (conf: Configuration) => {
                                let confProps: ConfigurationProperty[] = conf.properties;
                                for (var i = 0; i < confProps.length; i++) {
                                    if (confProps[i].name == "sparql") {
                                        this.query = confProps[i].value;
                                    } else if (confProps[i].name == "includeInferred") {
                                        this.inferred = confProps[i].value;
                                    }
                                }
                            }
                        );
                    } else if (properties[i].name == "variableBindings") {
                        this.parameterization = properties[i].value;

                        for (let par in this.parameterization) {
                            if (this.parameterization[par].bindingType != BindingTypeEnum.assignment) {
                                this.staticParameterization = false; //there is at least one binding not of assignment type (so to assign)
                            }
                        }
                    } else if (properties[i].name == "description") {
                        this.description = properties[i].value;
                    }
                }
            }
        );
    }

    onVarBindingsUpdate(bindings: Map<string, ARTNode>) {
        this.bindingsMap = bindings;
    }

    ok() {
        let filled: boolean = true;
        for (let key of Array.from(this.bindingsMap.keys())) {
            if (this.bindingsMap.get(key) == null) {
                this.basicModals.alert("Missing binding", "Missing variable binding '" + key + "'", ModalType.warning);
                return;
            }
        }

        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.searchService.customSearch(this.searchParameterizationReference, this.bindingsMap).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                if (searchResult.length == 0) {
                    this.basicModals.alert("Search", "No results found", ModalType.warning);
                } else { //1 or more results
                    ResourceUtils.sortResources(searchResult, SortAttribute.show);
                    this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, true).then(
                        (selectedResource: any) => {
                            this.activeModal.close(selectedResource);
                        },
                        () => { }
                    );
                }
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}