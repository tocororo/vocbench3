import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTLiteral, ARTNode, ARTURIResource, RDFTypesEnum } from "../../models/ARTResources";
import { SearchMode, SearchSettings, StatusFilter } from "../../models/Properties";
import { OntoLex, SKOS } from "../../models/Vocabulary";
import { SearchServices } from "../../services/searchServices";
import { ResourceUtils, SortAttribute } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "advanced-search-modal",
    templateUrl: "./advancedSearchModal.html"
})
export class AdvancedSearchModal {

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;

    searchString: string;

    statuses: { show: string, value: StatusFilter }[] = [
        { show: "Anything", value: StatusFilter.ANYTHING },
        { show: "Not deprecated", value: StatusFilter.NOT_DEPRECATED },
        { show: "Only deprecated", value: StatusFilter.ONLY_DEPRECATED }
        //UNDER_VALIDATION and UNDER_VALIDATION_FOR_DEPRECATION only if project has validation active
    ]
    selectedStatus: StatusFilter = this.statuses[0].value;

    //search mode use URI/LocalName
    useURI: boolean = true;
    useLocalName: boolean = true;
    useNotes: boolean = true;

    stringMatchModes: { labelTranslationKey: string, value: SearchMode }[] = [
        { labelTranslationKey: "SEARCH.SETTINGS.STARTS_WITH", value: SearchMode.startsWith },
        { labelTranslationKey: "SEARCH.SETTINGS.CONTAINS", value: SearchMode.contains },
        { labelTranslationKey: "SEARCH.SETTINGS.ENDS_WITH", value: SearchMode.endsWith },
        { labelTranslationKey: "SEARCH.SETTINGS.EXACT", value: SearchMode.exact },
        { labelTranslationKey: "SEARCH.SETTINGS.FUZZY", value: SearchMode.fuzzy }
    ];
    activeStringMatchMode: SearchMode;
    

    restrictLang: boolean = false;
    includeLocales: boolean = false;
    languages: string[];

    //types
    typesGroups: ARTURIResource[][] = [];

    //schemes
    showSchemeSelector: boolean = false;
    private schemesGroups: ARTURIResource[][] = [];

    //ingoing/outgoing links
    ingoingLinks: { first: ARTURIResource, second: ARTNode[] }[] = []; //first is the property, second is a list of values
    outgoingLinksValue: { first: ARTURIResource, second: ARTNode[] }[] = [];
    outgoingLinksFreeText: { predicate: ARTURIResource, searchString: string, mode: SearchMode }[] = [];

    constructor(public activeModal: NgbActiveModal, private searchService: SearchServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private browsingModals: BrowsingModalServices,
        private creationModals: CreationModalServices) {}

    ngOnInit() {
        let searchSettings: SearchSettings = VBContext.getWorkingProjectCtx().getProjectPreferences().searchSettings;
        this.useLocalName = searchSettings.useLocalName;
        this.useURI = searchSettings.useURI;
        this.useNotes = searchSettings.useNotes;

        this.activeStringMatchMode = searchSettings.stringMatchMode;

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

    selectRestrictionLanguages() {
        this.sharedModals.selectLanguages({key:"ACTIONS.SELECT_LANGUAGES"}, this.languages, false, true).then(
            (langs: string[]) => {
                this.languages = langs;
            },
            () => {}
        );
    }

    /** ===================== 
     * Types management
     * ===================== */

    addTypesGroup() {
        this.typesGroups.push([]);
    }

    deleteTypesGroup(index: number) {
        this.typesGroups.splice(index, 1);
    }

    addType(group: ARTURIResource[]) {
        this.browsingModals.browseClassTree({key:"DATA.ACTIONS.SELECT_CLASS"}).then(
            (type: ARTURIResource) => {
                group.push(type);
            }
        );
    }

    deleteType(group: ARTURIResource[], index: number) {
        group.splice(index, 1);
    }

    updateType(group: ARTURIResource[], index: number, type: ARTURIResource) {
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
        this.browsingModals.browseSchemeList({key:"DATA.ACTIONS.SELECT_SCHEME"}).then(
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

    addIngoingGroup() {
        this.ingoingLinks.push({ first: null, second: [] });
    }

    deleteIngoingGroup(index: number) {
        this.ingoingLinks.splice(index, 1);
    }

    updatePropIngoing(group: { first: ARTURIResource, second: ARTNode[] }, property: ARTURIResource) {
        group.first = property;
    }

    addIngoingValue(group: { first: ARTURIResource, second: ARTNode[] }) {
        this.sharedModals.pickResource({key:"ACTIONS.SELECT_RESOURCE"}).then(
            (value: ARTNode) => {
                group.second.push(value);
            },
            () => {}
        );
    }

    deleteIngoingValue(group: { first: ARTURIResource, second: ARTNode[] }, index: number) {
        group.second.splice(index, 1);
    }

    updateIngoingValue(group: { first: ARTURIResource, second: ARTNode[] }, index: number, value: ARTNode) {
        group.second[index] = value;
    }

    /** ===================== 
     * Outgoing links management value
     * ===================== */

    addOutgoingGroupValue() {
        this.outgoingLinksValue.push({ first: null, second: [] });
    }

    deleteOutgoingGroupValue(index: number) {
        this.outgoingLinksValue.splice(index, 1);
    }

    updatePropOutgoingValue(group: { first: ARTURIResource, second: ARTNode[] }, property: ARTURIResource) {
        group.first = property;
    }

    addOutgoingValue(group: { first: ARTURIResource, second: ARTNode[] }, type: RDFTypesEnum) {
        if (type == RDFTypesEnum.resource) {
            this.sharedModals.pickResource({key:"ACTIONS.SELECT_RESOURCE"}).then(
                (value: ARTNode) => {
                    group.second.push(value);
                },
                () => {}
            );
        } else if (type == RDFTypesEnum.literal) {
            this.creationModals.newTypedLiteral({key:"DATA.ACTIONS.CREATE_LITERAL"}).then(
                (values: ARTLiteral[]) => {
                    group.second.push(values[0]);
                },
                () => {}
            );
        }
    }

    deleteOutgoingValue(group: { first: ARTURIResource, second: ARTNode[] }, index: number) {
        group.second.splice(index, 1);
    }

    updateOutgoingValue(group: { first: ARTURIResource, second: ARTNode[] }, index: number, value: ARTNode) {
        group.second[index] = value;
    }

    /** ===================== 
     * Outgoing links management free text
     * ===================== */

    addOutgoingGroupFreeText() {
        this.outgoingLinksFreeText.push({ predicate: null, searchString: null, mode: VBContext.getWorkingProjectCtx().getProjectPreferences().searchSettings.stringMatchMode });
    }

    deleteOutgoingGroupFreeText(index: number) {
        this.outgoingLinksFreeText.splice(index, 1);
    }

    updatePropOutgoingFreeText(group: { predicate: ARTURIResource, searcString: string, mode: SearchMode }, property: ARTURIResource) {
        group.predicate = property;
    }

    //---------------------


    ok() {
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

        let outgoingLinksParam: { first: ARTURIResource, second: ARTNode[] }[] = [];
        this.outgoingLinksValue.forEach((pair: { first: ARTURIResource, second: ARTNode[] }) => {
            if (pair.first != null) {
                let values: ARTNode[] = [];
                pair.second.forEach((v: ARTNode) => {
                    if (v != null) {
                        values.push(v);
                    }
                });
                if (values.length > 0) {
                    outgoingLinksParam.push({ first: pair.first, second: values });
                }
            }
        });
        if (outgoingLinksParam.length == 0) {
            outgoingLinksParam = null;
        }

        let outgoingSearchParam: { predicate: ARTURIResource, searchString: string, mode: SearchMode }[] = [];
        this.outgoingLinksFreeText.forEach((triple: { predicate: ARTURIResource, searchString: string, mode: SearchMode }) => {
            if (triple.predicate != null && triple.searchString != null && triple.searchString.trim() != "") {
                outgoingSearchParam.push(triple);
            }
        });
        if (outgoingSearchParam.length == 0) {
            outgoingSearchParam = null;
        }

        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.searchService.advancedSearch(this.searchString, this.useLocalName, this.useURI, this.useNotes, this.activeStringMatchMode, 
            this.selectedStatus, langsPar, includeLocalesPar, typesParam, schemesParam, ingoingParam, outgoingLinksParam, outgoingSearchParam).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                if (searchResult.length == 0) {
                    this.basicModals.alert({key:"SEARCH.SEARCH"}, {key:"MESSAGES.NO_RESULTS_FOUND"}, ModalType.warning);
                } else { //1 or more results
                    ResourceUtils.sortResources(searchResult, SortAttribute.show);
                    this.sharedModals.selectResource({key:"SEARCH.SEARCH"}, {key:"MESSAGES.TOT_RESULTS_FOUND", params:{count: searchResult.length}}, searchResult, true).then(
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