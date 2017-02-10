import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTURIResource, ResAttribute} from '../../models/ARTResources';
import {SKOS} from '../../models/Vocabulary';

export class EnrichPropertyModalData extends BSModalContext {
    /**
     * @param property property to enrich with a resource
     * @param rangeClasses admitted range classes of the property
     * (these will represent the roots of the class tree)
     */
    constructor(
        public title: string = 'Add property value',
        public property: ARTURIResource,
        public rangeClasses?: ARTURIResource[]
    ) {
        super();
        if (rangeClasses != undefined && rangeClasses.length > 0) {
            this.rangeClasses = rangeClasses;
        }
    }
}

@Component({
    selector: "enrich-property-modal",
    templateUrl: "./enrichPropertyModal.html",
})
export class EnrichPropertyModal implements ModalComponent<EnrichPropertyModalData> {
    context: EnrichPropertyModalData;
    
    private allClasses: boolean; //tells if in the class tree should be shown all the classes or just the rangeClasses
    private treeRoots: ARTURIResource[];
    private selectedInstance: ARTURIResource;
    
    constructor(public dialog: DialogRef<EnrichPropertyModalData>) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        this.treeRoots = this.context.rangeClasses;
        if (this.context.rangeClasses == undefined || this.context.rangeClasses.length == 0) {
            this.allClasses = true;
        }
    }
    
    /**
     * Called when "Show all classes" checkbox changes status.
     * Resets the selectedInstance and update the  roots of the tree
     */
    private onCheckboxChange(checked: boolean) {
        this.selectedInstance = null;
        if (checked) {
            this.treeRoots = null;
        } else {
            this.treeRoots = this.context.rangeClasses;
        }
    }
    
    /**
     * Listener to click on element in the instance list. Updates the selectedInstance
     */
    private onInstanceSelected(instance: ARTURIResource) {
        this.selectedInstance = instance;
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        //to avoid that the returned resource has the "selected" attribute set to true
        this.selectedInstance.deleteAdditionalProperty(ResAttribute.SELECTED);
        this.dialog.close(this.selectedInstance);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}