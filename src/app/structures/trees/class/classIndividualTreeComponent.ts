import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { ARTURIResource } from "../../../models/ARTResources";
import { SKOS } from '../../../models/Vocabulary';
import { TreeListContext } from "../../../utils/UIUtils";
import { ProjectContext, VBContext } from "../../../utils/VBContext";
import { ClassTreePanelComponent } from "./classTreePanelComponent";

@Component({
    selector: "class-individual-tree",
    templateUrl: "./classIndividualTreeComponent.html"
})
export class ClassIndividualTreeComponent {

    @Input() context: TreeListContext;
    @Input() projectCtx: ProjectContext;
    @Input() roots: ARTURIResource[]; //roots of the class three
    @Input() schemes: ARTURIResource[]; //scheme to use in case the class selected is skos:Concept
    @Input() editable: boolean = true; //used only in right panel (instance/concept)
    @Input() deletable: boolean = true; //used only in right panel (instance/concept)
    @Input() allowMultiselection: boolean = false; //tells if the multiselection is allowed in the instance list panel
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();//when an instance or a concept is selected
    @Output() nodeChecked = new EventEmitter<ARTURIResource[]>();
    @Output() multiselectionStatus = new EventEmitter<boolean>(); //emitted when the multiselection changes status (activated/deactivated)
    /*in the future I might need an Output for selected class. In case, change nodeSelected in instanceSelected and
    create classSelected Output. (Memo: nodeSelected is to maintain the same Output of the other tree components)*/

    @ViewChild(ClassTreePanelComponent, { static: true }) classTreePanelChild: ClassTreePanelComponent;

    selectedClass: ARTURIResource = null; //the class selected from class tree
    currentSchemes: ARTURIResource[];//the scheme selecte in the concept tree (only if selected class is skos:Concept)
    selectedInstance: ARTURIResource; //the instance (or concept) selected in the instance list (or concept tree)

    ngOnInit() {
        if (this.schemes === undefined) { //if @Input scheme is not provided at all, get it from project preference
            this.currentSchemes = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().activeSchemes;
        } else { //if @Input scheme is provided (it could be null => no scheme-mode), initialize the tree with this scheme
            this.currentSchemes = this.schemes;
        }
        if (this.context == undefined) { //if not overwritten from a parent component (e.g. addPropertyValueModal), set its default
            this.context = TreeListContext.clsIndTree;
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
    onTreeClassSelected(cls: ARTURIResource) {
        if (this.selectedClass == undefined || (this.selectedClass != undefined && this.selectedClass.getURI() != cls.getURI())) {
            this.selectedInstance = null; //reset the instance only if selected class changes
            this.nodeSelected.emit(null);
        }
        this.selectedClass = cls;
    }

    /**
     * Listener to click on element in the instance list. Updates the selectedInstance
     */
    onInstanceSelected(instance: ARTURIResource) {
        this.selectedInstance = instance;
        this.nodeSelected.emit(this.selectedInstance);
    }

    private onNodeChecked(nodes: ARTURIResource[]) {
        this.nodeChecked.emit(nodes);
    }

    /**
     * Listener to schemeChanged event emitted by concept-tree when range class is skos:Concept.
     */
    private onConceptTreeSchemeChange() {
        this.selectedInstance = null;
        this.nodeSelected.emit(this.selectedInstance);
    }

    /**
     * Listener to lexiconChanged event emitted by lexical-entry-list when range class is ontolex:LexicalEntry.
     */
    private onLexEntryLexiconChange() {
        this.selectedInstance = null;
        this.nodeSelected.emit(this.selectedInstance);
    }

    private onMultiselectionChange(multiselection: boolean) {
        this.multiselectionStatus.emit(multiselection);
    }

    /**
     * Tells if the current selected range class is skos:Concept. It's useful to show concept tree
     * instead of instance list in the modal
     */
    private isRangeConcept(): boolean {
        return (this.selectedClass != undefined && this.selectedClass.getURI() == SKOS.concept.getURI());
    }

}