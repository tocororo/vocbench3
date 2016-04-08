import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {ARTURIResource} from '../../../utils/ARTResources';
import {ClassTreeComponent} from '../../../owl/classTree/classTreeComponent';
import {InstanceListComponent} from '../../../owl/instanceList/instanceListComponent';
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
    directives: [ClassTreeComponent, InstanceListComponent],
    providers: [PropertyServices]
})
export class EnrichPropertyModal implements ICustomModalComponent {
    
    private allClasses: boolean; //tells if in the class tree should be shown all the classes or just the rangeClasses
    private treeRoots: ARTURIResource[];
    private selectedClass: ARTURIResource;
    private selectedInstance: ARTURIResource;
    
    dialog: ModalDialogInstance;
    context: EnrichPropertyModalContent;
    propServices: PropertyServices;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal, propServices: PropertyServices) {
        this.dialog = dialog;
        this.context = <EnrichPropertyModalContent>modelContentData;
        this.propServices = propServices;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
        this.treeRoots = this.context.rangeClasses;
        if (this.context.rangeClasses == undefined) {
            this.allClasses = true;
        }
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
        this.selectedClass = cls;
    }
    
    /**
     * Listener to click on element in the instance list. Updates the selectedInstance
     */
    private onInstanceSelected(instance: ARTURIResource) {
        this.selectedInstance = instance;
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