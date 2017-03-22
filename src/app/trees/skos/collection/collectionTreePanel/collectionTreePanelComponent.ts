import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { CollectionTreeComponent } from "../collectionTree/collectionTreeComponent";
import { SkosServices } from "../../../../services/skosServices";
import { SkosxlServices } from "../../../../services/skosxlServices";
import { ModalServices } from "../../../../widget/modal/modalServices";
import { ARTURIResource, RDFResourceRolesEnum, RDFTypesEnum } from "../../../../models/ARTResources";
import { VocbenchCtx } from "../../../../utils/VocbenchCtx";
import { UIUtils } from "../../../../utils/UIUtils";

@Component({
    selector: "collection-tree-panel",
    templateUrl: "./collectionTreePanelComponent.html",
})
export class CollectionTreePanelComponent {
    @Input() editable: boolean = true; //if true show the buttons to edit the tree
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    @ViewChild(CollectionTreeComponent) viewChildTree: CollectionTreeComponent

    private rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    private selectedCollection: ARTURIResource;
    private searchInputPlaceholder: string;

    private ONTO_TYPE: string;

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices,
        private modalService: ModalServices, private vbCtx: VocbenchCtx) { }

    ngOnInit() {
        this.ONTO_TYPE = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
    }

    private createCollection() {
        this.modalService.newResource("Create new skos:Collection").then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createRootCollection(res.label, res.lang, res.name, null, RDFTypesEnum.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else { //SKOSXL
                    this.skosxlService.createRootCollection(res.label, res.lang, res.name, null, RDFTypesEnum.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                }
            },
            () => { }
        );
    }

    private createOrderedCollection() {
        this.modalService.newResource("Create new skos:OrderedCollection").then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createRootOrderedCollection(res.label, res.lang, res.name, null, RDFTypesEnum.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else { //SKOSXL
                    this.skosxlService.createRootOrderedCollection(res.label, res.lang, res.name, null, RDFTypesEnum.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                }
            },
            () => { }
        );
    }

    private createNestedCollection() {
        this.modalService.newResource("Create a nested skos:Collection").then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createNestedCollection(this.selectedCollection, res.label, res.lang, res.name, null, RDFTypesEnum.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else { //SKOSXL
                    this.skosxlService.createNestedCollection(this.selectedCollection, res.label, res.lang, res.name, null, RDFTypesEnum.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                }
            },
            () => { }
        );
    }

    private createNestedOrderedCollection() {
        this.modalService.newResource("Create a nested skos:OrderedCollection").then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createNestedOrderedCollection(this.selectedCollection, res.label, res.lang, res.name, null, RDFTypesEnum.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else { //SKOSXL
                    this.skosxlService.createNestedOrderedCollection(this.selectedCollection, res.label, res.lang, res.name, null, RDFTypesEnum.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                }
            },
            () => { }
        );
    }

    private deleteCollection() {
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        if (this.selectedCollection.getRole() == RDFResourceRolesEnum.skosCollection) {
            this.skosService.deleteCollection(this.selectedCollection).subscribe(
                stResp => {
                    this.selectedCollection = null;
                    this.nodeSelected.emit(undefined);
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
            );
        } else { //skosOrderedCollection
            this.skosService.deleteOrderedCollection(this.selectedCollection).subscribe(
                stResp => {
                    this.selectedCollection = null;
                    this.nodeSelected.emit(undefined);
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
            );
        }
    }

    private refresh() {
        this.viewChildTree.initTree();
    }

    //EVENT LISTENERS
    private onNodeSelected(node: ARTURIResource) {
        this.selectedCollection = node;
        this.nodeSelected.emit(node);
    }

}