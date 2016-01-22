import {Component, Input} from "angular2/core";
import {ConceptTreeComponent} from "../../tree/conceptTree/conceptTreeComponent";
import {SkosServices} from "../../services/skosServices";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {Deserializer} from "../../utils/Deserializer";
import {STResponseUtils} from "../../utils/STResponseUtils";
import {ROUTER_DIRECTIVES} from "angular2/router";

@Component({
	selector: "concept-tree-panel",
	templateUrl: "app/src/skos/conceptTreePanel/conceptTreePanelComponent.html",
	directives: [ConceptTreeComponent, ROUTER_DIRECTIVES], //ROUTER_DIRECTIVES for router_link in noScheme image button (check)
    providers: [SkosServices]
})
export class ConceptTreePanelComponent {
    @Input() scheme:ARTURIResource;
    
    private selectedConcept:ARTURIResource;
    private subscrNodeSelected;
    
	constructor(private skosService:SkosServices, private deserializer:Deserializer, private respUtils:STResponseUtils, 
            private eventHandler:VBEventHandler, private vbCtx:VocbenchCtx) {
        this.subscrNodeSelected = eventHandler.conceptTreeNodeSelectedEvent.subscribe(node => this.onNodeSelected(node));
    }
    
    ngOnDestroy() {
        this.subscrNodeSelected.unsubscribe();
    }
    
    public createConcept() {
        var conceptName = prompt("Insert concept name");
        if (conceptName == null) return;
        this.skosService.createConcept(conceptName, this.vbCtx.getScheme().getURI(), null, null)
            .subscribe(
                stResp => {
                    if (this.respUtils.isException(stResp)) { //when concept already exists
                        alert(this.respUtils.getExceptionMessage(stResp));
                    } else {
                        var newConc = this.deserializer.createURI(stResp);
                        newConc.setAdditionalProperty("children", []);
                        this.eventHandler.topConceptCreatedEvent.emit(newConc);       
                    }
                }
            );
    }
    
    public createNarrower() {
        var conceptName = prompt("Insert concept name");
        if (conceptName == null) return;
        this.skosService.createNarrower(conceptName, this.selectedConcept.getURI(), this.vbCtx.getScheme().getURI(), null, null)
            .subscribe(
                stResp => {
                    if (this.respUtils.isException(stResp)) { //when concept already exists
                        alert(this.respUtils.getExceptionMessage(stResp));
                    } else {
                        var newConc = this.deserializer.createURI(stResp);
                        newConc.setAdditionalProperty("children", []);
                        this.eventHandler.narrowerCreatedEvent.emit({"resource": newConc, "parent": this.selectedConcept});
                    }
                }
            )
    }
    
    public deleteConcept() {
        this.skosService.deleteConcept(this.selectedConcept.getURI())
            .subscribe(
                stResp => {
                    if (this.respUtils.isFail(stResp)) { //when concept has narrower
                        alert(this.respUtils.getFailMessage(stResp));
                    } else {
                        this.eventHandler.conceptDeletedEvent.emit(this.selectedConcept);
                        this.selectedConcept = null;
                    }
                }
            )
    }
    
    //EVENT LISTENERS
    
    private onNodeSelected(node:ARTURIResource) {
        this.selectedConcept = node;
    }
    
}