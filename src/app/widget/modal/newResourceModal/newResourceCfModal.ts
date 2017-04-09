import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { FormField } from "../../../models/CustomForms"
import { ARTLiteral, ARTURIResource } from "../../../models/ARTResources"
import { VBContext } from "../../../utils/VBContext"

export class NewResourceCfModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public cfId: string,
        public lang: string
    ) {
        super();
    }
}

@Component({
    selector: "new-resource-cf-modal",
    templateUrl: "./newResourceCfModal.html",
})
export class NewResourceCfModal implements ModalComponent<NewResourceCfModalData> {
    context: NewResourceCfModalData;

    //standard form
    private label: string;
    private lang: string;
    private namespace: string = "";
    private localName: string;

    //custom form
    private formFields: FormField[] = [];

    constructor(public dialog: DialogRef<NewResourceCfModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.lang = this.context.lang;
        this.namespace = VBContext.getDefaultNamespace();
        document.getElementById("toFocus").focus();
    }

    private onKeydown(event: KeyboardEvent) {
        if (event.which == 13) {
            if (this.isInputValid()) {
                this.ok(event);
            }
        }
    }

    private onLangChange(newLang: string) {
        this.lang = newLang;
    }

    private isInputValid(): boolean {
        var standardFormValid: boolean = (this.label != undefined && this.label.trim() != "");
        var customFormValid: boolean = true;
        for (var i = 0; i < this.formFields.length; i++) {
            var entry = this.formFields[i];
            var emptyString :boolean = false;
            try { if (entry['value'].trim() == "") { emptyString = true; } } catch (err) {} //entry value could be not a string, so the check is in a try-catch
            if (entry['checked'] && (entry['value'] == null || emptyString)) {
                customFormValid = false;
            }
        }
        return (standardFormValid && customFormValid);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        var entryMap: any = {}; //{key: svalue, key: value,...}
        for (var i = 0; i < this.formFields.length; i++) {
            var entry = this.formFields[i];
            if (entry['checked']) {
                //add the entry only if not already in
                var alreadyIn: boolean = false;
                for (var key in entryMap) {
                    if (key == entry.getUserPrompt()) {
                        alreadyIn = true;
                        break;
                    }
                }
                if (!alreadyIn) {
                    entryMap[entry.getUserPrompt()] = entry['value'];
                }
            }
        }

        var returnedData: { uri: ARTURIResource, label: ARTLiteral, cfValueMap: any} = {
            uri: null,
            label: new ARTLiteral(this.label, null, this.lang),
            cfValueMap: entryMap
        }
        //Set URI only if localName is not empty
        if (this.localName != null && this.localName.trim() != "") {
            returnedData.uri = new ARTURIResource(this.namespace + this.localName);
        }
        this.dialog.close(returnedData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}