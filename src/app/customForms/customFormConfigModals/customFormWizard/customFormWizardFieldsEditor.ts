import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTURIResource } from "src/app/models/ARTResources";
import { CustomForm, FormFieldType } from "src/app/models/CustomForms";
import { Language } from "src/app/models/LanguagesCountries";
import { DatatypesServices } from "src/app/services/datatypesServices";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalType } from "src/app/widget/modal/Modals";
import { ConstraintType, WizardAdvGraphEntry, WizardField, WizardFieldLiteral, WizardFieldUri, WizardNodeFromField } from "./CustomFormWizard";

@Component({
    selector: "custom-form-wizard-fields-editor",
    templateUrl: "./customFormWizardFieldsEditor.html",
    host: { class: "vbox" }
})
export class CustomFormWizardFieldsEditor {
    @Output() changed: EventEmitter<WizardFieldChangeEvent> = new EventEmitter();
    @Input() fields: WizardField[];
    @Input() advGraphs: WizardAdvGraphEntry[]; //useful when deleting a field in order to check if an adv graph refers to a node seeded by the field
    selectedField: WizardField;

    //selectors options
    constraintTypes: { [key: string]: ConstraintType[] } = { //map the type of the field with the allowed constraint types
        [FormFieldType.literal]: [ConstraintType.Enumeration, ConstraintType.Datatype, ConstraintType.LangString],
        [FormFieldType.uri]: [ConstraintType.Enumeration, ConstraintType.Role, ConstraintType.Range],
    };
    datatypes: ARTURIResource[];
    languages: Language[];

    constructor(private datatypeService: DatatypesServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.datatypeService.getDatatypes().subscribe(
            datatypes => {
                this.datatypes = datatypes;
            }
        )
    }

    //Changes on fields list
    addFieldUri() {
        let fieldLabel = "uri_field";
        let i = 1;
        while (this.fields.some(f => f.label == fieldLabel)) {
            fieldLabel = "uri_field" + i;
            i++;
        }

        let f = new WizardFieldUri(fieldLabel);
        this.fields.push(f)
        this.emitChangeEvent(f, WizardFieldEventType.created);
    }
    addFieldLiteral() {
        let fieldLabel = "lit_field";
        let i = 1;
        while (this.fields.some(f => f.label == fieldLabel)) {
            fieldLabel = "lit_field" + i;
            i++;
        }

        let f = new WizardFieldLiteral(fieldLabel);
        this.fields.push(f)
        this.emitChangeEvent(f, WizardFieldEventType.created);
    }

    removeField() {
        if (this.advGraphs.some(g => g.nodes.some(n => n instanceof WizardNodeFromField && n.fieldSeed == this.selectedField))) {
            this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.REFERENCED_NODE_DELETE_WARN" }, ModalType.warning).then(
                () => {
                    this.removeImpl();
                },
                () => {}
            )
        } else {
            this.removeImpl();
        }
    }
    removeImpl() {
        this.fields.splice(this.fields.indexOf(this.selectedField), 1);
        this.emitChangeEvent(this.selectedField, WizardFieldEventType.removed);
        this.selectedField = null;
    }

    //Changes on individual field
    onLabelChange(formField: WizardField) {
        formField.featureName = CustomForm.USER_PROMPT_PREFIX + formField.label;
        this.onFieldChange(formField);
    }
    onCollMinChange() {
        if (this.selectedField.collection.min > this.selectedField.collection.max) {
            this.selectedField.collection.max = this.selectedField.collection.min
        }
        this.onFieldChange(this.selectedField);
    }
    onCollMaxChange() {
        if (this.selectedField.collection.max < this.selectedField.collection.min) {
            this.selectedField.collection.min = this.selectedField.collection.max
        }
        this.onFieldChange(this.selectedField);
    }

    
    onFieldChange(field: WizardField) {
        this.emitChangeEvent(field, WizardFieldEventType.changed);
    }

    emitChangeEvent(field: WizardField, type: WizardFieldEventType) {
        this.changed.emit({ field: field, eventType: type });
    }

}

export interface WizardFieldChangeEvent {
    eventType: WizardFieldEventType;
    field: WizardField;
}
export enum WizardFieldEventType {
    created = "created",
    removed = "removed",
    changed = "changed",
}