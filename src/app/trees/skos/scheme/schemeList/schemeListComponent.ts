import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils } from "../../../../models/ARTResources";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { VBProperties, SearchSettings } from "../../../../utils/VBProperties";
import { SkosServices } from "../../../../services/skosServices";
import { SearchServices } from "../../../../services/searchServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "scheme-list",
    templateUrl: "./schemeListComponent.html",
})
export class SchemeListComponent {
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Input() hideSearch: boolean = false;

    private rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    private schemeList: ARTURIResource[];
    private selectedScheme: ARTURIResource;

    constructor(private skosService: SkosServices, private searchService: SearchServices, private vbProp: VBProperties,
        private basicModals: BasicModalServices) { }

    ngOnInit() {
        if (!AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_GET_SCHEMES)) {
            return;
        }

        this.skosService.getAllSchemes().subscribe( //new service
            schemeList => {
                //sort by show if rendering is active, uri otherwise
                let attribute: "show" | "value" = this.rendering ? "show" : "value";
                ResourceUtils.sortResources(schemeList, attribute);
                this.schemeList = schemeList;
            }
        );
    }

    private selectScheme(scheme: ARTURIResource) {
        if (this.selectedScheme == undefined) {
            this.selectedScheme = scheme;
            this.selectedScheme.setAdditionalProperty(ResAttribute.SELECTED, true);
        } else if (this.selectedScheme.getURI() != scheme.getURI()) {
            this.selectedScheme.deleteAdditionalProperty(ResAttribute.SELECTED);
            this.selectedScheme = scheme;
            this.selectedScheme.setAdditionalProperty(ResAttribute.SELECTED, true);
        }
        this.selectedScheme = scheme;
        this.nodeSelected.emit(scheme);
    }

    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.basicModals.alert("Search", "Please enter a valid string to search", "error");
        } else {
            let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
            let searchLangs: string[];
            if (searchSettings.restrictLang) {
                searchLangs = searchSettings.languages;
            }
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.conceptScheme], searchSettings.useLocalName, 
                searchSettings.useURI, searchSettings.stringMatchMode, searchLangs).subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.selectScheme(this.getSchemeToSelectFromList(searchResult[0]));
                        } else { //multiple results, ask the user which one select
                            ResourceUtils.sortResources(searchResult, this.rendering ? "show" : "value");
                            this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
                                (selectedResource: any) => {
                                    this.selectScheme(this.getSchemeToSelectFromList(selectedResource));
                                },
                                () => { }
                            );
                        }
                    }
                }
                );
        }
    }

    /**
     * Retrieves from the schemeList the scheme to select. This method is necessary because searchResource service
     * returns a new ARTURIResource that has the same attribute of the one in the schemeList but is not the same object,
     * so I need to invoke selectScheme to the one in the list, not to the one returned from service
     */
    private getSchemeToSelectFromList(scheme: ARTURIResource): ARTURIResource {
        for (var i = 0; i < this.schemeList.length; i++) {
            if (this.schemeList[i].getURI() == scheme.getURI()) {
                return this.schemeList[i];
            }
        }
    }

}