import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CollectionTreeComponent } from "../collectionTree/collectionTreeComponent";
import { SkosServices } from "../../../services/skosServices";
import { SkosxlServices } from "../../../services/skosxlServices";
import { ModalServices } from "../../../widget/modal/modalServices";
import { ARTURIResource, RDFResourceRolesEnum, RDFTypesEnum } from "../../../utils/ARTResources";
import { VocbenchCtx } from "../../../utils/VocbenchCtx";

@Component({
    selector: "collection-tree-panel",
    templateUrl: "./collectionTreePanelComponent.html",
})
export class CollectionTreePanelComponent {
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

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
            result => {
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createRootCollection(result.label, result.lang, result.name,
                        this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe();
                } else { //SKOSXL
                    this.skosxlService.createRootCollection(result.label, result.lang, result.name,
                        this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe();
                }
            },
            () => { }
        );
    }

    private createOrderedCollection() {
        this.modalService.newResource("Create new skos:OrderedCollection", this.vbCtx.getContentLanguage()).then(
            result => {
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createRootOrderedCollection(result.label, result.lang, result.name,
                        this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe();
                } else { //SKOSXL
                    this.skosxlService.createRootOrderedCollection(result.label, result.lang, result.name,
                        this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe();
                }
            },
            () => { }
        );
    }

    private createNestedCollection() {
        this.modalService.newResource("Create a nested skos:Collection", this.vbCtx.getContentLanguage()).then(
            result => {
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createNestedCollection(this.selectedCollection, result.label, result.lang,
                        result.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe();
                } else { //SKOSXL
                    this.skosxlService.createNestedCollection(this.selectedCollection, result.label, result.lang,
                        result.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe();
                }
            },
            () => { }
        );
    }

    private createNestedOrderedCollection() {
        this.modalService.newResource("Create a nested skos:OrderedCollection", this.vbCtx.getContentLanguage()).then(
            result => {
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createNestedOrderedCollection(this.selectedCollection, result.label, result.lang,
                        result.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe();
                } else { //SKOSXL
                    this.skosxlService.createNestedOrderedCollection(this.selectedCollection, result.label, result.lang,
                        result.name, this.vbCtx.getContentLanguage(true), RDFTypesEnum.uri).subscribe();
                }
            },
            () => { }
        );
    }

    private deleteCollection() {
        if (this.selectedCollection.getRole() == RDFResourceRolesEnum.skosCollection) {
            this.skosService.deleteCollection(this.selectedCollection).subscribe(
                stResp => {
                    this.selectedCollection = null;
                    this.nodeSelected.emit(undefined);
                }
            );
        } else { //skosOrderedCollection
            this.skosService.deleteOrderedCollection(this.selectedCollection).subscribe(
                stResp => {
                    this.selectedCollection = null;
                    this.nodeSelected.emit(undefined);
                }
            );
        }
    }

    //EVENT LISTENERS
    private onNodeSelected(node: ARTURIResource) {
        this.selectedCollection = node;
        this.nodeSelected.emit(node);
    }

}