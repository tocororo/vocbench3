import { Component, ViewChild } from "@angular/core";
import { AbstractTreePanel } from "../../../abstractTreePanel"
import { CollectionTreeComponent } from "../collectionTree/collectionTreeComponent";
import { SkosServices } from "../../../../services/skosServices";
import { SearchServices } from "../../../../services/searchServices";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";
import { SKOS } from "../../../../models/Vocabulary";
import { UIUtils } from "../../../../utils/UIUtils";

@Component({
    selector: "collection-tree-panel",
    templateUrl: "./collectionTreePanelComponent.html",
})
export class CollectionTreePanelComponent extends AbstractTreePanel {
    @ViewChild(CollectionTreeComponent) viewChildTree: CollectionTreeComponent

    private searchInputPlaceholder: string;

    constructor(private skosService: SkosServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, basicModals: BasicModalServices) {
        super(cfService, basicModals);
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
        this.creationModals.newSkosResourceCf("Create new " + collectionType.getShow(), collectionType, true).then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (collectionType.getURI() == SKOS.collection.getURI()) {
                    this.skosService.createRootCollection(SKOS.collection, res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else if (collectionType.getURI() == SKOS.orderedCollection.getURI()) {
                    this.skosService.createRootCollection(SKOS.orderedCollection, res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                }
            },
            () => { }
        );
    }

    private createNestedCollection(collectionType: ARTURIResource) {
         this.creationModals.newSkosResourceCf("Create a nested" + collectionType.getShow(), collectionType, true).then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (collectionType.getURI() == SKOS.collection.getURI()) {
                    this.skosService.createNestedCollection(
                            SKOS.collection, this.selectedNode, res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else if (collectionType.getURI() == SKOS.orderedCollection.getURI()) {
                    this.skosService.createNestedCollection(
                            SKOS.orderedCollection, this.selectedNode, res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
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
                    this.selectedNode = null;
                    this.nodeSelected.emit(undefined);
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
            );
        } else { //skosOrderedCollection
            this.skosService.deleteOrderedCollection(this.selectedNode).subscribe(
                stResp => {
                    this.selectedNode = null;
                    this.nodeSelected.emit(undefined);
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
        if (searchedText.trim() == "") {
            this.basicModals.alert("Search", "Please enter a valid string to search", "error");
        } else {
            UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.skosCollection], true, true, "contain").subscribe(
                searchResult => {
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                    if (searchResult.length == 0) {
                        this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.viewChildTree.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.viewChildTree.openTreeAt(selectedResource);
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
        }
    }

}