import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {ARTURIResource} from '../../../utils/ARTResources';
import {VocbenchCtx} from '../../../utils/VocbenchCtx';
import {SKOS} from '../../../utils/Vocabulary';
import {ClassTreeComponent} from '../../../owl/classTree/classTreeComponent';
import {InstanceListComponent} from '../../../owl/instanceList/instanceListComponent';
import {ConceptTreeComponent} from '../../../skos/concept/conceptTree/conceptTreeComponent';
import {PropertyServices} from '../../../services/propertyServices';

export class EnrichPropertyModalContent {
    public title: string = 'Add property value'
    public property: ARTURIResource;
    public rangeClasses: ARTURIResource[];
    /**
     * @param property property to enrich with a resource
     * @param rangeClasses admitted range classes of the property
     * (these will represent the roots of the class tree)
     */
    constructor(title: string, property: ARTURIResource, rangeClasses?: ARTURIResource[]) {
        this.title = title;
        this.property = property;
        if (rangeClasses != undefined && rangeClasses.length > 0) {
            this.rangeClasses = rangeClasses;
        }
    }
}

@Component({
    selector: "enrich-property-modal",
    templateUrl: "app/src/resourceView/renderer/resViewModals/enrichPropertyModal.html",
    directives: [ClassTreeComponent, InstanceListComponent, ConceptTreeComponent],
    providers: [PropertyServices]
})
export class EnrichPropertyModal implements ICustomModalComponent {
    
    private allClasses: boolean; //tells if in the class tree should be shown all the classes or just the rangeClasses
    private treeRoots: ARTURIResource[];
    private selectedClass: ARTURIResource;
    private selectedInstance: ARTURIResource;
    
    private currentScheme: ARTURIResource;//used where skos:Concept is selected as range class and a concept tree is shown
    
    dialog: ModalDialogInstance;
    context: EnrichPropertyModalContent;
    propServices: PropertyServices;
    vbCtx: VocbenchCtx;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal, propServices: PropertyServices, vbCtx: VocbenchCtx) {
        this.dialog = dialog;
        this.context = <EnrichPropertyModalContent>modelContentData;
        this.propServices = propServices;
        this.vbCtx = vbCtx;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
        this.treeRoots = this.context.rangeClasses;
        if (this.context.rangeClasses == undefined) {
            this.allClasses = true;
        }
        this.currentScheme = this.vbCtx.getScheme();
    }
    
    /**
     * Called when "Show all classes" checkbox changes status.
     * Resets the selectedClass and selectedInstance and update the rangeClasses
     * that represents the roots of the tree
     */
    private onCheckboxChange(checked) {
        this.selectedClass = null;
        this.selectedInstance = null;
        if (checked) {
            this.treeRoots = null;
        } else {
            this.treeRoots = this.context.rangeClasses;
        }
    }
    
    /**
     * Listener to the event itemSelected thrown by the class-tree. Updates the selectedClass
     */
    private onTreeClassSelected(cls: ARTURIResource) {
        if (this.selectedClass == undefined || (this.selectedClass != undefined && this.selectedClass.getURI() != cls.getURI())) {
            this.selectedInstance = null; //reset the instance only if selected class changes
        }
        this.selectedClass = cls;
    }
    
    /**
     * Tells if the current selected range class is skos:Concept. It's useful to show concept tree
     * instead of instance list in the modal
     */
    private isRangeConcept(): boolean {
        return (this.selectedClass != undefined && this.selectedClass.getURI() == SKOS.concept.getURI());
    }
    
    /**
     * Listener to click on element in the instance list. Updates the selectedInstance
     */
    private onInstanceSelected(instance: ARTURIResource) {
        this.selectedInstance = instance;
    }
    
    /**
     * Listener to schemeChanged event emitted by concept-tree when range class is skos:Concept.
     */
    private onConceptTreeSchemeChange() {
        this.selectedInstance = null;
    }
    
    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedInstance);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}