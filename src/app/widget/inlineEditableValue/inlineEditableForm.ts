import { Component, Input } from '@angular/core';
import { Form } from 'src/app/models/LexicographerView';
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
            disabled: this.disabled,
            proposedAddRes: false,
            proposedAddTriple: false,
            proposedRemoveRes: false,
            proposedRemoveTriple: false
        }
        //init statuses
        if (this.value.isInStagingAdd()) {
            this.ngClassValue.proposedAddRes = true;
        } else if (this.value.isInStagingRemove()) {
            this.ngClassValue.proposedRemoveRes = true;
        }
        if (this.value.scope == TripleScopes.staged) {
            this.ngClassValue.proposedAddTriple = true;
        } else if (this.value.scope == TripleScopes.del_staged) {
            this.ngClassValue.proposedRemoveTriple = true;
        }
        //in addition to the status of the Form, also the writtenRep could have the status
        //TODO
    }

}