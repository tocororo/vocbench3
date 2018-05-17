import { Component, ViewChild } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils, SortAttribute } from "../../../../models/ARTResources";
import { SearchSettings } from "../../../../models/Properties";
import { SKOS } from "../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { SearchServices } from "../../../../services/searchServices";
import { SkosServices } from "../../../../services/skosServices";
import { UIUtils } from "../../../../utils/UIUtils";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBProperties } from "../../../../utils/VBProperties";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { NewResourceWithLiteralCfModalReturnData } from "../../../../widget/modal/creationModal/newResourceModal/shared/newResourceWithLiteralCfModal";
import { AbstractTreePanel } from "../../../abstractTreePanel";
import { CollectionTreeComponent } from "../collectionTree/collectionTreeComponent";

@Component({
    selector: "collection-tree-panel",
    templateUrl: "./collectionTreePanelComponent.html",
})
export class CollectionTreePanelComponent extends AbstractTreePanel {
    @ViewChild(CollectionTreeComponent) viewChildTree: CollectionTreeComponent

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.skosCollection;

    private searchInputPlaceholder: string;

    constructor(private skosService: SkosServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties) {
        super(cfService, resourceService, basicModals, eventHandler, vbProp);
    }

    //top bar commands handlers

    createRoot(role: RDFResourceRolesEnum) {
        let collectionType: ARTURIResource;
        if (role == RDFResourceRolesEnum.skosCollection) {
            collectionType = SKOS.collection;
        } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
            collectionType = SKOS.orderedCollection;
        }
        this.createCollection(collectionType);
    }

    createChild(role: RDFResourceRolesEnum) {
        let collectionType: ARTURIResource;
        if (role == RDFResourceRolesEnum.skosCollection) {
            collectionType = SKOS.collection;
        } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
            collectionType = SKOS.orderedCollection;
        }
        this.createNestedCollection(collectionType);
    }

    private createCollection(collectionType: ARTURIResource) {
        this.creationModals.newResourceWithLiteralCf("Create new " + collectionType.getShow(), collectionType, true).then(
            (data: NewResourceWithLiteralCfModalReturnData) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (collectionType.getURI() == SKOS.collection.getURI()) {
                    this.skosService.createCollection(SKOS.collection, data.literal, data.uriResource, null, data.cls, data.cfValue).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        (err: Error) => {
                            if (err.name.endsWith('PrefAltLabelClashException')) {
                                this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                    confirm => {
                                        this.skosService.createCollection(SKOS.collection, data.literal, data.uriResource, null, data.cls, data.cfValue, false).subscribe(
                                            stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                                        );
                                    },
                                    () => {}
                                );
                            }
                        }
                    );
                } else if (collectionType.getURI() == SKOS.orderedCollection.getURI()) {
                    this.skosService.createCollection(SKOS.orderedCollection, data.literal, data.uriResource, null, data.cls, data.cfValue).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        (err: Error) => {
                            if (err.name.endsWith('PrefAltLabelClashException')) {
                                this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                    confirm => {
                                        this.skosService.createCollection(SKOS.orderedCollection, data.literal, data.uriResource, null, data.cls, data.cfValue, false).subscribe(
                                            stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                                        );
                                    },
                                    () => {}
                                );
                            }
                        }
                    );
                }
            },
            () => { }
        );
    }

    private createNestedCollection(collectionType: ARTURIResource) {
         this.creationModals.newResourceWithLiteralCf("Create a nested" + collectionType.getShow(), collectionType, true).then(
            (data: NewResourceWithLiteralCfModalReturnData) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (collectionType.getURI() == SKOS.collection.getURI()) {
                    this.skosService.createCollection(
                            SKOS.collection, data.literal, data.uriResource, this.selectedNode, data.cls, data.cfValue).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        (err: Error) => {
                            if (err.name.endsWith('PrefAltLabelClashException')) {
                                this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                    confirm => {
                                        this.skosService.createCollection(SKOS.collection, data.literal, data.uriResource, this.selectedNode, data.cls, data.cfValue, false).subscribe(
                                            stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                                        );
                                    },
                                    () => {}
                                );
                            }
                        }
                    );
                } else if (collectionType.getURI() == SKOS.orderedCollection.getURI()) {
                    this.skosService.createCollection(
                            SKOS.orderedCollection, data.literal, data.uriResource, this.selectedNode, data.cls, data.cfValue).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        (err: Error) => {
                            if (err.name.endsWith('PrefAltLabelClashException')) {
                                this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                    confirm => {
                                        this.skosService.createCollection(SKOS.orderedCollection, data.literal, data.uriResource, this.selectedNode, data.cls, data.cfValue, false).subscribe(
                                            stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                                        );
                                    }, 
                                    () => {}
                                );
                            }
                        }
                    );
                }
            },
            () => { }
        );
    }

    delete() {
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        if (this.selectedNode.getRole() == RDFResourceRolesEnum.skosCollection) {
            this.skosService.deleteCollection(this.selectedNode).subscribe(
                stResp => {
                    this.nodeDeleted.emit(this.selectedNode);
                    this.selectedNode = null;
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
            );
        } else { //skosOrderedCollection
            this.skosService.deleteOrderedCollection(this.selectedNode).subscribe(
                stResp => {
                    this.nodeDeleted.emit(this.selectedNode);
                    this.selectedNode = null;
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
            );
        }
    }

    refresh() {
        this.selectedNode = null;
        this.viewChildTree.initTree();
    }

    //search handlers

    doSearch(searchedText: string) {
        let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.skosCollection], searchSettings.useLocalName, 
            searchSettings.useURI, searchSettings.useNotes, searchSettings.stringMatchMode, searchLangs, includeLocales).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (searchResult.length == 0) {
                    this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                } else { //1 or more results
                    if (searchResult.length == 1) {
                        this.openTreeAt(searchResult[0]);
                    } else { //multiple results, ask the user which one select
                        ResourceUtils.sortResources(searchResult, this.rendering ? SortAttribute.show : SortAttribute.value);
                        this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
                            (selectedResource: any) => {
                                this.openTreeAt(selectedResource); //then open the tree on the searched resource
                            },
                            () => { }
                        );
                    }
                }
            }
        );
    }

    openTreeAt(resource: ARTURIResource) {
        this.viewChildTree.openTreeAt(resource);
    }

}