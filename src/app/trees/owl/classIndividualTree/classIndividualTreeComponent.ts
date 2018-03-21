import { Component, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { VBProperties } from '../../../utils/VBProperties';
import { ARTURIResource } from "../../../models/ARTResources";
import { SKOS } from '../../../models/Vocabulary';

@Component({
    selector: "class-individual-tree",
    templateUrl: "./classIndividualTreeComponent.html",
})
export class ClassIndividualTreeComponent {

    @Input() roots: ARTURIResource[]; //roots of the class three
    @Input() schemes: ARTURIResource[]; //scheme to use in case the class selected is skos:Concept
    @Input() editable: boolean = true; //used only in right panel (instance/concept)
    @Input() deletable: boolean = true; //used only in right panel (instance/concept)
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();//when an instance or a concept is selected
    /*in the future I might need an Output for selected class. In case, change nodeSelected in instanceSelected and
    create classSelected Output. (Memo: nodeSelected is to maintain the same Output of the other tree components)*/

    private selectedClass: ARTURIResource; //the class selected from class tree
    private currentSchemes: ARTURIResource[];//the scheme selecte in the concept tree (only if selected class is skos:Concept)
    private selectedInstance: ARTURIResource; //the instance (or concept) selected in the instance list (or concept tree)

    constructor(private preferences: VBProperties) { }

    ngOnInit() {
        if (this.schemes === undefined) { //if @Input scheme is not provided at all, get it from project preference
            this.currentSchemes = this.preferences.getActiveSchemes();
        } else { //if @Input scheme is provided (it could be null => no scheme-mode), initialize the tree with this scheme
            this.currentSchemes = this.schemes;
        }
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