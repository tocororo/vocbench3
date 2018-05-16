import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTLiteral, ARTNode, ARTURIResource, RDFTypesEnum, ResourceUtils, SortAttribute } from "../../models/ARTResources";
import { SearchMode, SearchSettings, StatusFilter } from "../../models/Properties";
import { OntoLex, SKOS } from "../../models/Vocabulary";
import { SearchServices } from "../../services/searchServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "advanced-search-modal",
    templateUrl: "./advancedSearchModal.html"
})
export class AdvancedSearchModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private searchString: string;

    private statuses: { show: string, value: StatusFilter }[] = [
        { show: "Anything", value: StatusFilter.ANYTHING },
        { show: "Not deprecated", value: StatusFilter.NOT_DEPRECATED },
        { show: "Only deprecated", value: StatusFilter.ONLY_DEPRECATED }
        //UNDER_VALIDATION and UNDER_VALIDATION_FOR_DEPRECATION only if project has validation active
    ]
    private selectedStatus: StatusFilter = this.statuses[0].value;

    //search mode use URI/LocalName
    private useURI: boolean = true;
    private useLocalName: boolean = true;

    private searchModes: { show: string, value: SearchMode }[] = [
        { show: "Starts with", value: SearchMode.startsWith },
        { show: "Contains", value: SearchMode.contains },
        { show: "Ends with", value: SearchMode.endsWith },
        { show: "Exact", value: SearchMode.exact },
        { show: "Fuzzy", value: SearchMode.fuzzy }
    ];
    private activeSearchMode: SearchMode;

    private restrictLang: boolean = false;
    private includeLocales: boolean = false;
    private languages: string[];

    //types
    private typesGroups: ARTURIResource[][] = [];

    //schemes
    private showSchemeSelector: boolean = false;
    private schemesGroups: ARTURIResource[][] = [];

    //ingoing/outgoing links
    private ingoingLinks: { first: ARTURIResource, second: ARTNode[] }[] = []; //first is the property, second is a list of values
    private outgoingLinks: { first: ARTURIResource, second: ARTNode[] }[] = [];

    constructor(public dialog: DialogRef<BSModalContext>, private searchService: SearchServices, private vbProp: VBProperties,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private browsingModals: BrowsingModalServices,
        private creationModals: CreationModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
        this.useLocalName = searchSettings.useLocalName;
        this.useURI = searchSettings.useURI;

        this.activeSearchMode = searchSettings.stringMatchMode;

        this.restrictLang = searchSettings.restrictLang;
        this.includeLocales = searchSettings.includeLocales;
        this.languages = searchSettings.languages;

        let modelType: string = VBContext.getWorkingProject().getModelType();
        this.showSchemeSelector = modelType == SKOS.uri || modelType == OntoLex.uri;

        if (VBContext.getWorkingProject().isValidationEnabled()) {
            this.statuses.push(
                { show: "Under validation", value: StatusFilter.UNDER_VALIDATION },
                { show: "Under validation for deprecation", value: StatusFilter.UNDER_VALIDATION_FOR_DEPRECATION }
            );
        }

    }

    private selectRestrictionLanguages() {
        this.sharedModals.selectLanguages("Language restrictions", this.languages, true).then(
            (langs: string[]) => {
                this.languages = langs;
            },
            () => {}
        );
    }

    /** ===================== 
     * Types management
     * ===================== */

    private addTypesGroup() {
        this.typesGroups.push([]);
    }

    private deleteTypesGroup(index: number) {
        this.typesGroups.splice(index, 1);
    }

    private addType(group: ARTURIResource[]) {
        this.browsingModals.browseClassTree("Select a class").then(
            (type: ARTURIResource) => {
                group.push(type);
            }
        );
    }

    private deleteType(group: ARTURIResource[], index: number) {
        group.splice(index, 1);
    }

    private updateType(group: ARTURIResource[], index: number, type: ARTURIResource) {
        group[index] = type;
    }


    /** ===================== 
     * Schemes management
     * ===================== */

    private addSchemesGroup() {
        this.schemesGroups.push([]);
    }

    private deleteSchemesGroup(index: number) {
        this.schemesGroups.splice(index, 1);
    }

    private addScheme(group: ARTURIResource[]) {
        this.browsingModals.browseSchemeList("Select a scheme").then(
            (scheme: ARTURIResource) => {
                group.push(scheme);
            }
        );
    }

    private deleteScheme(group: ARTURIResource[], index: number) {
        group.splice(index, 1);
    }

    private updateScheme(group: ARTURIResource[], index: number, scheme: ARTURIResource) {
        group[index] = scheme;
    }
    
    /** ===================== 
     * Ingoing links management
     * ===================== */

    private addIngoingGroup() {
        this.ingoingLinks.push({ first: null, second: [] });
    }

    private deleteIngoingGroup(index: number) {
        this.ingoingLinks.splice(index, 1);
    }

    private updatePropIngoing(group: { first: ARTURIResource, second: ARTNode[] }, property: ARTURIResource) {
        group.first = property;
    }

    private addIngoingValue(group: { first: ARTURIResource, second: ARTNode[] }) {
        this.sharedModals.pickResource("Select a resource").then(
            (value: ARTNode) => {
                group.second.push(value);
            }
        );
    }

    private deleteIngoingValue(group: { first: ARTURIResource, second: ARTNode[] }, index: number) {
        group.second.splice(index, 1);
    }

    private updateIngoingValue(group: { first: ARTURIResource, second: ARTNode[] }, index: number, value: ARTNode) {
        group.second[index] = value;
    }

    /** ===================== 
     * Outgoing links management
     * ===================== */

    private addOutgoingGroup() {
        this.outgoingLinks.push({ first: null, second: [] });
    }

    private deleteOutgoingGroup(index: number) {
        this.outgoingLinks.splice(index, 1);
    }

    private updatePropOutgoing(group: { first: ARTURIResource, second: ARTNode[] }, property: ARTURIResource) {
        group.first = property;
    }

    private addOutgoingValue(group: { first: ARTURIResource, second: ARTNode[] }, type: RDFTypesEnum) {
        if (type == RDFTypesEnum.resource) {
            this.sharedModals.pickResource("Select a resource").then(
                (value: ARTNode) => {
                    group.second.push(value);
                }
            );
        } else if (type == RDFTypesEnum.typedLiteral) {
            this.creationModals.newTypedLiteral("Create typed literal").then(
                (value: ARTLiteral) => {
                    group.second.push(value);
                }
            );
        } else if (type == RDFTypesEnum.plainLiteral) {
            this.creationModals.newPlainLiteral("Create literal").then(
                (value: ARTLiteral) => {
                    group.second.push(value);
                }
            );
        }
    }

    private deleteOutgoingValue(group: { first: ARTURIResource, second: ARTNode[] }, index: number) {
        group.second.splice(index, 1);
    }

    private updateOutgoingValue(group: { first: ARTURIResource, second: ARTNode[] }, index: number, value: ARTNode) {
        group.second[index] = value;
    }



    ok(event: Event) {
        let langsPar: string[];
        let includeLocalesPar: boolean;
        if (this.restrictLang) {
            langsPar = this.languages;
            includeLocalesPar = this.includeLocales;
        }

        //filter out groups with null elements
        let typesParam: ARTURIResource[][] = [];
        this.typesGroups.forEach((group: ARTURIResource[]) => {
            let g: ARTURIResource[] = [];
            group.forEach((type: ARTURIResource) => {
                if (type != null) {
                    g.push(type);
                }
            })
            if (g.length > 0) {
                typesParam.push(g);
            }
        });
        if (typesParam.length == 0) {
            typesParam = null;
        }

        let schemesParam: ARTURIResource[][] = [];
        this.schemesGroups.forEach((group: ARTURIResource[]) => {
            let g: ARTURIResource[] = [];
            group.forEach((scheme: ARTURIResource) => {
                if (scheme != null) {
                    g.push(scheme);
                }
            })
            if (g.length > 0) {
                schemesParam.push(g);
            }
        });
        if (schemesParam.length == 0) {
            schemesParam = null;
        }

        //filter out links without property or with null values
        let ingoingParam: { first: ARTURIResource, second: ARTNode[] }[] = [];
        this.ingoingLinks.forEach((pair: { first: ARTURIResource, second: ARTNode[] }) => {
            if (pair.first != null) {
                let values: ARTNode[] = [];
                pair.second.forEach((v: ARTNode) => {
                    if (v != null) {
                        values.push(v);
                    }
                });
                if (values.length > 0) {
                    ingoingParam.push({ first: pair.first, second: values });
                }
            }
        });
        if (ingoingParam.length == 0) {
            ingoingParam = null;
        }

        let outgoingParam: { first: ARTURIResource, second: ARTNode[] }[] = [];
        this.outgoingLinks.forEach((pair: { first: ARTURIResource, second: ARTNode[] }) => {
            if (pair.first != null) {
                let values: ARTNode[] = [];
                pair.second.forEach((v: ARTNode) => {
                    if (v != null) {
                        values.push(v);
                    }
                });
                if (values.length > 0) {
                    outgoingParam.push({ first: pair.first, second: values });
                }
            }
        });
        if (outgoingParam.length == 0) {
            outgoingParam = null;
        }

        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.searchService.advancedSearch(this.searchString, this.useLocalName, this.useURI, this.activeSearchMode, this.selectedStatus,
            langsPar, includeLocalesPar, typesParam, schemesParam, ingoingParam, outgoingParam).subscribe(
            searchResult => {
                console.log(searchResult);
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                if (searchResult.length == 0) {
                    this.basicModals.alert("Search", "No results found for '" + this.searchString + "'", "warning");
                } else { //1 or more results
                    /**
                     * what to do? open the tree/list or show the res view?
                     * keep in mind that a resource returned by this search could be not reachable in any tree/list,
                     * moreover it could be not easy to determine which tree/list open
                     */
                    if (searchResult.length == 1) {
                        // this.openTreeAt(searchResult[0]);
                    } else { //multiple results, ask the user which one select
                        ResourceUtils.sortResources(searchResult, SortAttribute.show);
                        this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, true).then(
                            (selectedResource: any) => {
                                // this.openTreeAt(selectedResource);
                            },
                            () => { }
                        );
                    }
                }
            }
        );


        // event.stopPropagation();
        // event.preventDefault();
        // this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }

}