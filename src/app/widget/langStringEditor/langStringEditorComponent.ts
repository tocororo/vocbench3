import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ARTLiteral } from "../../models/ARTResources";
import { Language, Languages } from "../../models/LanguagesCountries";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBProperties } from "../../utils/VBProperties";
import { SharedModalServices } from "../modal/sharedModal/sharedModalServices";

@Component({
    selector: "lang-string-editor",
    templateUrl: "./langStringEditorComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LangStringEditorComponent), multi: true,
    }]
})
export class LangStringEditorComponent implements ControlValueAccessor, OnInit { // based on RdfResourceComponent

    @Input() disabled: boolean = false;

    lang: Language;
    stringValue: string; // string value of the literal
    
    private literalValue: ARTLiteral; // the rdf:langString being edited (the model) 

    public constructor(private sharedModals: SharedModalServices, private preferences: VBProperties) {
    }

    ngOnInit(): void {
        this.initLang();   
    }

    initLang() {
        if (this.lang == null) {
            this.lang = Languages.getLanguageFromTag(Languages.priorityLangs[0]);
        }
    }

    onStringValueChanged() {
        this.onModelChanged();
    }

    editLanguage() {
        if (this.disabled) return;
        this.sharedModals.selectLanguages({key:"ACTIONS.SELECT_LANGUAGE"}, (this.lang ? [this.lang.tag] : []), true, false).then(
            langs => {
                this.lang = Languages.getLanguageFromTag(langs[0]);
                this.onModelChanged();
            },
            () => { }
        );
    }

    private onModelChanged() {
        let text = this.stringValue ? this.stringValue.trim() : "";
        if (text == "") {
            this.literalValue = null;
        } else {
            this.literalValue = new ARTLiteral(text, null, this.lang.tag);
        }
        this.propagateChange(this.literalValue);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: ARTLiteral | string) {
        if (obj) {
            if (obj instanceof ARTLiteral) {
                this.literalValue = obj;
            } else {
                this.literalValue = ResourceUtils.parseLiteral(obj);
            }
        } else {
            this.literalValue = null;
        }

        if (this.literalValue) {
            this.stringValue = this.literalValue.getValue();
            this.lang = Languages.getLanguageFromTag(this.literalValue.getLang());
        } else {
            this.stringValue = null;
            this.lang = null;
        }
        this.initLang();
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: ARTLiteral) => { };

    //--------------------------------------------------

}
