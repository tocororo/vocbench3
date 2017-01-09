import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { CollectionTreeComponent } from "../collectionTree/collectionTreeComponent";
import { SkosServices } from "../../../../services/skosServices";
import { SkosxlServices } from "../../../../services/skosxlServices";
import { ModalServices } from "../../../../widget/modal/modalServices";
import { ARTURIResource, RDFResourceRolesEnum, RDFTypesEnum } from "../../../../utils/ARTResources";
import { VocbenchCtx } from "../../../../utils/VocbenchCtx";

@Component({
    selector: "collection-tree-panel",
    templateUrl: "./collectionTreePanelComponent.html",
})
export class CollectionTreePanelComponent {
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    @ViewChild(CollectionTreeComponent) viewChildTree: CollectionTreeComponent

    private selectedCollection: ARTURIResource;
    private searchInputPlaceholder: string;

    private ONTO_TYPE: string;

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices,
        private modalService: ModalServices, private vbCtx: VocbenchCtx) { }

    ngOnInit() {
        this.ONTO_TYPE = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
    }

    private createCollection() {
        this.modalService.newResource("Create new skos:Collection", this.vbCtx.getContentLanguage()).then(
            (res: any) => {
                this.viewChildTree.blockDivElement.nativeElement.style.display = "block";
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createRootCollection(res.label, res.lang, res.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe(
                        stResp => this.viewChildTree.blockDivElement.nativeElement.style.display = "none",
                        err => this.viewChildTree.blockDivElement.nativeElement.style.display = "none"
                    );
                } else { //SKOSXL
                    this.skosxlService.createRootCollection(res.label, res.lang, res.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe(
                        stResp => this.viewChildTree.blockDivElement.nativeElement.style.display = "none",
                        err => this.viewChildTree.blockDivElement.nativeElement.style.display = "none"
                    );
                }
            },
            () => { }
        );
    }

    private createOrderedCollection() {
        this.modalService.newResource("Create new skos:OrderedCollection", this.vbCtx.getContentLanguage()).then(
            (res: any) => {
                this.viewChildTree.blockDivElement.nativeElement.style.display = "block";
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createRootOrderedCollection(res.label, res.lang, res.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe(
                        stResp => this.viewChildTree.blockDivElement.nativeElement.style.display = "none",
                        err => this.viewChildTree.blockDivElement.nativeElement.style.display = "none"
                    );
                } else { //SKOSXL
                    this.skosxlService.createRootOrderedCollection(res.label, res.lang, res.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe(
                        stResp => this.viewChildTree.blockDivElement.nativeElement.style.display = "none",
                        err => this.viewChildTree.blockDivElement.nativeElement.style.display = "none"
                    );
                }
            },
            () => { }
        );
    }

    private createNestedCollection() {
        this.modalService.newResource("Create a nested skos:Collection", this.vbCtx.getContentLanguage()).then(
            (res: any) => {
                this.viewChildTree.blockDivElement.nativeElement.style.display = "block";
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createNestedCollection(this.selectedCollection, res.label, res.lang, res.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe(
                        stResp => this.viewChildTree.blockDivElement.nativeElement.style.display = "none",
                        err => this.viewChildTree.blockDivElement.nativeElement.style.display = "none"
                    );
                } else { //SKOSXL
                    this.skosxlService.createNestedCollection(this.selectedCollection, res.label, res.lang, res.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe(
                        stResp => this.viewChildTree.blockDivElement.nativeElement.style.display = "none",
                        err => this.viewChildTree.blockDivElement.nativeElement.style.display = "none"
                    );
                }
            },
            () => { }
        );
    }

    private createNestedOrderedCollection() {
        this.modalService.newResource("Create a nested skos:OrderedCollection", this.vbCtx.getContentLanguage()).then(
            (res: any) => {
                this.viewChildTree.blockDivElement.nativeElement.style.display = "block";
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createNestedOrderedCollection(this.selectedCollection, res.label, res.lang, res.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe(
                        stResp => this.viewChildTree.blockDivElement.nativeElement.style.display = "none",
                        err => this.viewChildTree.blockDivElement.nativeElement.style.display = "none"
                    );
                } else { //SKOSXL
                    this.skosxlService.createNestedOrderedCollection(this.selectedCollection, res.label, res.lang, res.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe(
                        stResp => this.viewChildTree.blockDivElement.nativeElement.style.display = "none",
                        err => this.viewChildTree.blockDivElement.nativeElement.style.display = "none"
                    );
                }
            },
            () => { }
        );
    }

    private deleteCollection() {
        this.viewChildTree.blockDivElement.nativeElement.style.display = "block";
        if (this.selectedCollection.getRole() == RDFResourceRolesEnum.skosCollection) {
            this.skosService.deleteCollection(this.selectedCollection).subscribe(
                stResp => {
                    this.selectedCollection = null;
                    this.nodeSelected.emit(undefined);
                    this.viewChildTree.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.viewChildTree.blockDivElement.nativeElement.style.display = "none"; }
            );
        } else { //skosOrderedCollection
            this.skosService.deleteOrderedCollection(this.selectedCollection).subscribe(
                stResp => {
                    this.selectedCollection = null;
                    this.nodeSelected.emit(undefined);
                    this.viewChildTree.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.viewChildTree.blockDivElement.nativeElement.style.display = "none"; }
            );
        }
    }

    //EVENT LISTENERS
    private onNodeSelected(node: ARTURIResource) {
        this.selectedCollection = node;
        this.nodeSelected.emit(node);
    }

}