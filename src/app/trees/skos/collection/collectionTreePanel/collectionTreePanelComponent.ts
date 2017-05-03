import { Component, ViewChild } from "@angular/core";
import { AbstractTreePanel } from "../../../abstractTreePanel"
import { CollectionTreeComponent } from "../collectionTree/collectionTreeComponent";
import { SkosServices } from "../../../../services/skosServices";
import { SkosxlServices } from "../../../../services/skosxlServices";
import { SearchServices } from "../../../../services/searchServices";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { ModalServices } from "../../../../widget/modal/basicModal/modalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";
import { SKOS } from "../../../../models/Vocabulary";
import { VBContext } from "../../../../utils/VBContext";
import { UIUtils } from "../../../../utils/UIUtils";

@Component({
    selector: "collection-tree-panel",
    templateUrl: "./collectionTreePanelComponent.html",
})
export class CollectionTreePanelComponent extends AbstractTreePanel {
    @ViewChild(CollectionTreeComponent) viewChildTree: CollectionTreeComponent

    private searchInputPlaceholder: string;

    private ONTO_TYPE: string;

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices, private searchService: SearchServices,
        private creationModal: CreationModalServices,
        cfService: CustomFormsServices, modalService: ModalServices) {
        super(cfService, modalService);
    }

    ngOnInit() {
        this.ONTO_TYPE = VBContext.getWorkingProject().getPrettyPrintOntoType();
    }

    //top bar commands handlers

    createRoot(role: RDFResourceRolesEnum) {
        let collectionType: ARTURIResource;
        if (role == RDFResourceRolesEnum.skosCollection) {
            collectionType = SKOS.collection;
        } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
            collectionType = SKOS.orderedCollection;
        }
        this.selectCustomForm(collectionType).then(
            cfId => { this.createCollection(collectionType, cfId); }
        );
    }

    createChild(role: RDFResourceRolesEnum) {
        let collectionType: ARTURIResource;
        if (role == RDFResourceRolesEnum.skosCollection) {
            collectionType = SKOS.collection;
        } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
            collectionType = SKOS.orderedCollection;
        }
        this.selectCustomForm(collectionType).then(
            cfId => { this.createNestedCollection(collectionType, cfId); }
        );
    }

    private createCollection(collectionType: ARTURIResource, cfId: string) {
        this.creationModal.newSkosResourceCf("Create new " + collectionType.getShow(), collectionType, false, cfId).then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
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
                } else { //SKOSXL
                    if (collectionType.getURI() == SKOS.collection.getURI()) {
                        this.skosxlService.createRootCollection(SKOS.collection, res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                            stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                            err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                        );
                    } else if (collectionType.getURI() == SKOS.orderedCollection.getURI()) {
                        this.skosxlService.createRootCollection(SKOS.orderedCollection, res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                            stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                            err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                        );
                    }
                }
            },
            () => { }
        );
    }

    private createNestedCollection(collectionType: ARTURIResource, cfId: string) {
         this.creationModal.newSkosResourceCf("Create a nested" + collectionType.getShow(), collectionType, false, cfId).then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
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
                } else { //SKOSXL
                    if (collectionType.getURI() == SKOS.collection.getURI()) {
                        this.skosxlService.createNestedCollection(
                                SKOS.collection, this.selectedNode, res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                            stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                            err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                        );
                    } else if (collectionType.getURI() == SKOS.orderedCollection.getURI()) {
                        this.skosxlService.createNestedCollection(
                                SKOS.orderedCollection, this.selectedNode, res.label, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                            stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                            err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                        );
                    }
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
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.skosCollection], true, true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.viewChildTree.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
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