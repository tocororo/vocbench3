import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ARTLiteral } from "../../models/ARTResources";
import { Languages } from "../../models/LanguagesCountries";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
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

    unknownFlagImgSrc: string = UIUtils.getFlagImgSrc(null); // image associated with unknown (or null) language

    imgSrc: string; // image associated with the current language
    langFlagAvailable: boolean = false; //true if the language (if any) has a flag icon available

    stringValue: string; // string value of the literal
    langTag: string; // language tag of the literal
    language: string; // human-friendly rendering of the language (name plus tag)
    
    private literalValue: ARTLiteral; // the rdf:langString being edited (the model) 

    public constructor(private sharedModals: SharedModalServices, private preferences: VBProperties) {
    }

    ngOnInit(): void {
        this.initLangInfo();
    }

    /**
     * Initializes language information. If the language tag is null, then initializes it with the first item in the priority list of languages
     */
    private initLangInfo() {
        if (!this.langTag) {
            this.langTag = Languages.priorityLangs[0];
        }
        let lang = Languages.getLanguageFromTag(this.langTag);
        if (lang.tag != lang.name) {
            this.language = lang.name + " (" + lang.tag + ")";
        } else {
            this.language = lang.name;
        }
        this.imgSrc = UIUtils.getFlagImgSrc(this.langTag);
        if (this.preferences.getShowFlags()) {
            //just check if the image name doesn't contains "unknown" since the image name for unavailable flag is flag_unknown.png
            this.langFlagAvailable = !this.imgSrc.includes("flag_unknown");
        } else {
            this.langFlagAvailable = false; //if the show_flag preference is false, show always the langTag
        }
    }

    onStringValueChanged() {
        this.onModelChanged();
    }

    editLanguage() {
        if (this.disabled) return;
        this.sharedModals.selectLanguages({key:"ACTIONS.SELECT_LANGUAGE"}, (this.langTag ? [this.langTag] : []), true, false).then(
            langs => {
                this.langTag = langs[0];
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
            this.literalValue = new ARTLiteral(text, null, this.langTag);
        }
        this.initLangInfo();
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
            this.langTag = this.literalValue.getLang();
        } else {
            this.stringValue = null;
            this.langTag = null;
        }

        this.initLangInfo();
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
