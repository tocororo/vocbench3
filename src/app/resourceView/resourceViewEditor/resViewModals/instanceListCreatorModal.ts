import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource, ResAttribute } from '../../../models/ARTResources';
import { UIUtils } from "../../../utils/UIUtils";

@Component({
    selector: "instance-list-creator-modal",
    templateUrl: "./instanceListCreatorModal.html",
})
export class InstanceListCreatorModal {
    @Input() title: string;

    selectedClass: ARTURIResource; //class selected in the class tree
    selectedSourceInstance: ARTURIResource; //instance selected in the source instance list
    selectedTargetInstance: ARTURIResource; //instance selected in the source instance list
    instanceList: Array<ARTURIResource> = []; //instances to return

    duplicateInstance: ARTURIResource; //instance tried to add to the instanceList but already there 

    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) { }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    /**
     * Adds an instance taken from source list to the target list of instances to return
     */
    addToList() {
        //check if the instance is already in the list
        for (let i = 0; i < this.instanceList.length; i++) {
            if (this.instanceList[i].getURI() == this.selectedSourceInstance.getURI()) {
                this.duplicateInstance = this.instanceList[i];
                return;
            }
        }
        //push a copy of the selected instance to avoid problem with "selected" attribute
        let inst = new ARTURIResource(
            this.selectedSourceInstance.getURI(), this.selectedSourceInstance.getShow(), this.selectedSourceInstance.getRole());
        inst.setAdditionalProperty(ResAttribute.EXPLICIT, this.selectedSourceInstance.getAdditionalProperty(ResAttribute.EXPLICIT));
        this.instanceList.push(inst);
        this.duplicateInstance = null;
    }

    /**
     * Removes an instance from the target list to return
     */
    removeFromList() {
        this.instanceList.splice(this.instanceList.indexOf(this.selectedTargetInstance), 1);
        this.selectedTargetInstance = null;
        this.duplicateInstance = null;
    }

    /**
     * Listener to the event nodeSelected thrown by the class-tree. Updates the selectedClass
     */
    onTreeClassSelected(cls: ARTURIResource) {
        this.selectedClass = cls;
    }

    /**
     * Listener to click on element in the source instance list. Updates the selectedSourceInstance
     */
    onSourceListInstanceSelected(instance: ARTURIResource) {
        this.selectedSourceInstance = instance;
    }

    /**
     * Listener to click on element in the target instance list. Updates the selectedTargetInstance
     */
    onTargetListInstanceSelected(instance: ARTURIResource) {
        this.selectedTargetInstance = instance;
    }

    /**
     * Returns true if the given instance is the current selectedTargetInstance. Useful in the view to apply
     * style to the selected instance in the target instance list
     */
    isTargetListInstanceSelected(instance: ARTURIResource) {
        return this.selectedTargetInstance == instance;
    }

    ok() {
        this.activeModal.close(this.instanceList);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}