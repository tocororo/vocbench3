import {Component, Input, Output, EventEmitter, SimpleChanges} from "@angular/core";
import {VocbenchCtx} from '../../../utils/VocbenchCtx';
import {ARTURIResource} from "../../../models/ARTResources";
import {SKOS} from '../../../models/Vocabulary';

@Component({
    selector: "class-individual-tree",
    templateUrl: "./classIndividualTreeComponent.html",
})
export class ClassIndividualTreeComponent {
    
    @Input() roots: ARTURIResource[];//roots of the class three
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();//when an instance or a concept is selected
    /*in the future I might need an Output for selected class. In case, change nodeSelected in instanceSelected and
    create classSelected Output. (Memo: nodeSelected is to maintain the same Output of the other tree components)*/
    
    private selectedClass: ARTURIResource; //the class selected from class tree
    private currentScheme: ARTURIResource;//the scheme selecte in the concept tree (only if selected class is skos:Concept)
    private selectedInstance: ARTURIResource; //the instance (or concept) selected in the instance list (or concept tree)
    
    constructor(private vbCtx: VocbenchCtx) {}
    
    ngOnInit() {
        this.currentScheme = this.vbCtx.getScheme();
    }
    
    ngOnChanges(changes: SimpleChanges) {
        if (changes['roots']) { //when roots changes, deselect eventals class and instance selected
            this.selectedClass = null;
            this.selectedInstance = null;
        }
    }
    
    /**
     * Listener to the event nodeSelected thrown by the class-tree. Updates the selectedClass
     */
    private onTreeClassSelected(cls: ARTURIResource) {
        if (this.selectedClass == undefined || (this.selectedClass != undefined && this.selectedClass.getURI() != cls.getURI())) {
            this.selectedInstance = null; //reset the instance only if selected class changes
            this.nodeSelected.emit(null);
        }
        this.selectedClass = cls;
    }
    
    /**
     * Listener to click on element in the instance list. Updates the selectedInstance
     */
    private onInstanceSelected(instance: ARTURIResource) {
        this.selectedInstance = instance;
        this.nodeSelected.emit(this.selectedInstance);
    }
    
    /**
     * Listener to schemeChanged event emitted by concept-tree when range class is skos:Concept.
     */
    private onConceptTreeSchemeChange() {
        this.selectedInstance = null;
    }
    
    /**
     * Tells if the current selected range class is skos:Concept. It's useful to show concept tree
     * instead of instance list in the modal
     */
    private isRangeConcept(): boolean {
        return (this.selectedClass != undefined && this.selectedClass.getURI() == SKOS.concept.getURI());
    }
    
}