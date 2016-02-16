import {Component, Input, Output, EventEmitter, ViewChild} from "angular2/core";
import {ConceptTreeComponent} from "../../../tree/conceptTree/conceptTreeComponent";
import {SkosServices} from "../../../services/skosServices";
import {OntoSearchServices} from "../../../services/ontoSearchServices";
import {ARTURIResource} from "../../../utils/ARTResources";
import {VBEventHandler} from "../../../utils/VBEventHandler";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";
import {Deserializer} from "../../../utils/Deserializer";
import {ROUTER_DIRECTIVES} from "angular2/router";

@Component({
	selector: "concept-tree-panel",
	templateUrl: "app/src/skos/concept/conceptTreePanel/conceptTreePanelComponent.html",
	directives: [ConceptTreeComponent, ROUTER_DIRECTIVES], //ROUTER_DIRECTIVES for routerLink in noScheme image button
    providers: [SkosServices, OntoSearchServices],
})
export class ConceptTreePanelComponent {
    @Input() scheme:ARTURIResource;
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    @ViewChild(ConceptTreeComponent) viewChildTree: ConceptTreeComponent;
    
    private selectedConcept:ARTURIResource;
    private searchInputPlaceholder: string;
    
	constructor(private skosService:SkosServices, private searchService: OntoSearchServices, private deserializer:Deserializer, 
            private eventHandler:VBEventHandler, private vbCtx:VocbenchCtx) {
    }
    
    ngOnInit() {
        this.searchInputPlaceholder = this.scheme ? "Search..." : "Search not available in no-scheme mode"; 
    }
    
    private createConcept() {
        var conceptName = prompt("Insert concept name");
        if (conceptName == null) return;
        this.skosService.createConcept(conceptName, this.vbCtx.getScheme().getURI(), null, null)
            .subscribe(
                stResp => {
                    var newConc = this.deserializer.createURI(stResp);
                    newConc.setAdditionalProperty("children", []);
                    this.eventHandler.topConceptCreatedEvent.emit(newConc);
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    private createNarrower() {
        var conceptName = prompt("Insert concept name");
        if (conceptName == null) return;
        this.skosService.createNarrower(conceptName, this.selectedConcept.getURI(), this.vbCtx.getScheme().getURI(), null, null)
            .subscribe(
                stResp => {
                    var newConc = this.deserializer.createURI(stResp);
                    newConc.setAdditionalProperty("children", []);
                    this.eventHandler.narrowerCreatedEvent.emit({"resource": newConc, "parent": this.selectedConcept});
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            )
    }
    
    private deleteConcept() {
        this.skosService.deleteConcept(this.selectedConcept.getURI())
            .subscribe(
                stResp => {
                    this.eventHandler.conceptDeletedEvent.emit(this.selectedConcept);
                    this.selectedConcept = null;
                    this.itemSelected.emit(undefined);
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            )
    }
    
    private doSearch(searchedText: string) {
        this.searchService.searchOntology(searchedText, "concept", this.vbCtx.getScheme().getURI()).subscribe(
            stResp => {
                var searchResult = this.deserializer.createURIArray(stResp);
                if (searchResult.length == 0) {
                    alert("No results found for '" + searchedText + "'");
                } else if (searchResult.length == 1) {
                    this.viewChildTree.openTreeAt(searchResult[0]);
                } else {
                    //modal dialog still not available, so it's not possible to let the user choose which result prefer
                    alert(searchResult.length + " results found. This function is currently not available for multiple results");
                }
                
            },
            err => {
                alert("Error: " + err);
                console.error(err.stack);
            });
    }
    
    /**
     * Handles the keypress event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(keyIdentifier, searchedText) {
        if (keyIdentifier == "Enter") {
            if (searchedText.trim() == "") {
                alert("Please enter a valid string to search");
            } else {
                this.doSearch(searchedText);           
            }
        }
    }
    
    //EVENT LISTENERS
    private onNodeSelected(node:ARTURIResource) {
        this.selectedConcept = node;
        this.itemSelected.emit(node);
    }
    
}