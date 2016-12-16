import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTURIResource, ResAttribute} from '../../utils/ARTResources';

export class InstanceListCreatorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title') {
        super();
    }
}

@Component({
    selector: "instance-list-creator-modal",
    templateUrl: "./instanceListCreatorModal.html",
})
export class InstanceListCreatorModal implements ModalComponent<InstanceListCreatorModalData> {
    context: InstanceListCreatorModalData;
    
    private selectedClass: ARTURIResource; //class selected in the class tree
    private selectedSourceInstance: ARTURIResource; //instance selected in the source instance list
    private selectedTargetInstance: ARTURIResource; //instance selected in the source instance list
    private manchExpr: string; //manchester expression written in input field
    private instanceList: Array<ARTURIResource> = []; //instances to return
    
    private duplicateInstance: ARTURIResource; //instance tried to add to the instanceList but already there 
    
    constructor(public dialog: DialogRef<InstanceListCreatorModalData>) {
        this.context = dialog.context;
    }
    
    /**
     * Adds an instance taken from source list to the target list of instances to return
     */
    private addToList() {
        //check if the instance is already in the list
        for (var i = 0; i < this.instanceList.length; i++) {
            if (this.instanceList[i].getURI() == this.selectedSourceInstance.getURI()) {
                this.duplicateInstance = this.instanceList[i];
                return;
            }
        }
        //push a copy of the selected instance to avoid problem with "selected" attribute
        var inst = new ARTURIResource(
            this.selectedSourceInstance.getURI(), this.selectedSourceInstance.getShow(), this.selectedSourceInstance.getRole());
        inst.setAdditionalProperty(ResAttribute.EXPLICIT, this.selectedSourceInstance.getAdditionalProperty(ResAttribute.EXPLICIT)); 
        this.instanceList.push(inst);
        this.duplicateInstance = null;
    }
    
    /**
     * Removes an instance from the target list to return
     */
    private removeFromList() {
        this.instanceList.splice(this.instanceList.indexOf(this.selectedTargetInstance), 1);
        this.selectedTargetInstance = null;
        this.duplicateInstance = null;
    }
    
    /**
     * Listener to the event nodeSelected thrown by the class-tree. Updates the selectedClass
     */
    private onTreeClassSelected(cls: ARTURIResource) {
        this.selectedClass = cls;
    }
    
    /**
     * Listener to click on element in the source instance list. Updates the selectedSourceInstance
     */
    private onSourceListInstanceSelected(instance: ARTURIResource) {
        this.selectedSourceInstance = instance;
    }
    
    /**
     * Listener to click on element in the target instance list. Updates the selectedTargetInstance
     */
    private onTargetListInstanceSelected(instance: ARTURIResource) {
        this.selectedTargetInstance = instance;
    }
    
    /**
     * Returns true if the given instance is the current selectedTargetInstance. Useful in the view to apply
     * style to the selected instance in the target instance list
     */
    private isTargetListInstanceSelected(instance: ARTURIResource) {
        return this.selectedTargetInstance == instance;
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.instanceList);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}