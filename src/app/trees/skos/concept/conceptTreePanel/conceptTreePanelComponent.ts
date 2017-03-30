import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { ConceptTreeComponent } from "../conceptTree/conceptTreeComponent";
import { SkosServices } from "../../../../services/skosServices";
import { SkosxlServices } from "../../../../services/skosxlServices";
import { ModalServices } from "../../../../widget/modal/modalServices";
import { VBContext } from "../../../../utils/VBContext";
import { VBPreferences } from "../../../../utils/VBPreferences";
import { UIUtils } from "../../../../utils/UIUtils";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";

@Component({
    selector: "concept-tree-panel",
    templateUrl: "./conceptTreePanelComponent.html",
})
export class ConceptTreePanelComponent {
    @Input() editable: boolean = true; //if true show the buttons to edit the tree
    @Input() scheme: ARTURIResource; //if set the concept tree is initialized with this scheme, otherwise with the scheme from VB context
    @Input() schemeChangeable: boolean = false; //if true, above the tree is shown a menu to select a scheme
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    @ViewChild(ConceptTreeComponent) viewChildTree: ConceptTreeComponent

    private ONTO_TYPE: string;

    private rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    private selectedConcept: ARTURIResource;
    private activeScheme: ARTURIResource;

    private eventSubscriptions: any[] = [];

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices,
        private modalService: ModalServices, private eventHandler: VBEventHandler, private preferences: VBPreferences) {
        
        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (newScheme: ARTURIResource) => this.onSchemeChanged(newScheme)));
    }

    ngOnInit() {
        this.ONTO_TYPE = VBContext.getWorkingProject().getPrettyPrintOntoType();
        if (this.scheme != undefined) { //if @Input scheme is provided, initialize the tree with this scheme
            this.activeScheme = this.scheme;
        } else { //otherwise get the scheme from VB context
            this.activeScheme = VBContext.getScheme();
        }
    }

    private createTopConcept() {
        this.modalService.newResource("Create new skos:Concept").then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createTopConcept(res.label, res.lang, VBContext.getScheme(), res.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else { //SKOSXL
                    this.skosxlService.createTopConcept(res.label, res.lang, VBContext.getScheme(), res.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                }
            },
            () => { }
        );
    }

    private createNarrower() {
        this.modalService.newResource("Create a skos:narrower").then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createNarrower(res.label, res.lang, this.selectedConcept, VBContext.getScheme(), res.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else { //SKOSXL
                    this.skosxlService.createNarrower(res.label, res.lang, this.selectedConcept, VBContext.getScheme(), res.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                }
            },
            () => { }
        );
    }

    private deleteConcept() {
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        if (this.ONTO_TYPE == "SKOS") {
            this.skosService.deleteConcept(this.selectedConcept).subscribe(
                stResp => {
                    this.selectedConcept = null;
                    this.nodeSelected.emit(undefined);
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
            );
        } else { //SKOSXL
            this.skosxlService.deleteConcept(this.selectedConcept).subscribe(
                stResp => {
                    this.selectedConcept = null;
                    this.nodeSelected.emit(undefined);
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
            );
        }
    }

    private refresh() {
        this.selectedConcept = null;
        this.viewChildTree.initTree();
    }

    //EVENT LISTENERS
    private onNodeSelected(node: ARTURIResource) {
        this.selectedConcept = node;
        this.nodeSelected.emit(node);
    }

    //when a concept is removed from a scheme, it should be still visible in res view,
    //but no more selected in the tree if it was in the current scheme 
    private onConceptRemovedFromScheme(concept: ARTURIResource) {
        this.selectedConcept = null;
    }

    private onSchemeChanged(scheme: ARTURIResource) {
        this.activeScheme = scheme;
    }

}