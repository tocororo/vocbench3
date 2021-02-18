import { Component, Input } from '@angular/core';
import { Form, LexicalResourceUtils } from 'src/app/models/LexicographerView';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { TripleScopes } from '../../models/ARTResources';
import { BasicModalServices } from '../modal/basicModal/basicModalServices';
import { AbstractInlineEditable } from './inlineEditable';

@Component({
    selector: 'inline-editable-form',
    templateUrl: './inlineEditableForm.html',
    styleUrls: ["./inlineEditableValue.css"]
})
export class InlineEditableForm extends AbstractInlineEditable {
    @Input() value: Form;

    constructor(basicModals: BasicModalServices) {
        super(basicModals);
    }

    initValue() {
        this.stringValue = (this.value != null) ? this.value.writtenRep[0].getShow() : null;
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
        if (LexicalResourceUtils.isInStagingAdd(this.value)) {
            this.ngClassValue.proposedAddRes = true;
        } else if (LexicalResourceUtils.isInStagingRemove(this.value)) {
            this.ngClassValue.proposedRemoveRes = true;
        }
        if (this.value.scope == TripleScopes.staged) {
            this.ngClassValue.proposedAddTriple = true;
        } else if (this.value.scope == TripleScopes.del_staged) {
            this.ngClassValue.proposedRemoveTriple = true;
        }
        //in addition to the status of the Form, also the writtenRep could have the status
        if (ResourceUtils.isTripleInStagingAdd(this.value.writtenRep[0])) {
            this.ngClassValue.proposedAddTriple = true;
        } else  if (ResourceUtils.isTripleInStagingRemove(this.value.writtenRep[0])) {
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