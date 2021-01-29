import { Component, Input } from '@angular/core';
import { ARTNode, ARTResource } from '../../models/ARTResources';
import { ResourceUtils } from '../../utils/ResourceUtils';
import { BasicModalServices } from '../modal/basicModal/basicModalServices';
import { AbstractInlineEditable } from './inlineEditable';

@Component({
    selector: 'inline-editable-value',
    templateUrl: './inlineEditableValue.html',
    styleUrls: ["./inlineEditableValue.css"]
})
export class InlineEditableValue extends AbstractInlineEditable {
    @Input() value: ARTNode;

    constructor(basicModals: BasicModalServices) {
        super(basicModals)
    }

    initValue() {
        this.stringValue = (this.value != null) ? this.value.getShow() : null;
        this.pristineStringValue = this.stringValue;
    }

    /**
     * Initializes the class of the resource text: green if the resource is in the staging-add-graph, red if it's in the staging-remove-graph
     */
    initRenderingClassStatus() {
        //reset all statuses
        this.ngClassValue = {
            proposedAddRes: false,
            proposedAddTriple: false,
            proposedRemoveRes: false,
            proposedRemoveTriple: false
        }
        //init statuses
        if (this.value instanceof ARTResource) {
            if (ResourceUtils.isResourceInStagingAdd(this.value)) {
                this.ngClassValue.proposedAddRes = true;
            } else if (ResourceUtils.isResourceInStagingRemove(this.value)) {
                this.ngClassValue.proposedRemoveRes = true;
            }
        }
        if (ResourceUtils.isTripleInStagingAdd(this.value)) {
            this.ngClassValue.proposedAddTriple = true;
        } else if (ResourceUtils.isTripleInStagingRemove(this.value)) {
            this.ngClassValue.proposedRemoveTriple = true;
        }

        if (
            this.ngClassValue.proposedAddRes || this.ngClassValue.proposedAddTriple || 
            this.ngClassValue.proposedRemoveRes || this.ngClassValue.proposedRemoveTriple
        ) {
            this.disabled = true;
        }
    }

}