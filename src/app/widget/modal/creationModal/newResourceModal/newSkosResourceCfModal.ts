import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { CustomFormsServices } from "../../../../services/customFormsServices"
import { ModalServices } from "../../basicModal/modalServices"
import { BrowsingServices } from "../../browsingModal/browsingServices"
import { CustomForm, FormField } from "../../../../models/CustomForms"
import { ARTLiteral, ARTURIResource } from "../../../../models/ARTResources"

export class NewSkosResourceCfModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public cls: ARTURIResource, //class that this modal is creating
        public cfId: string,
        public lang: string
    ) {
        super();
    }
}

@Component({
    selector: "new-skos-resource-cf-modal",
    templateUrl: "./newSkosResourceCfModal.html",
})
export class NewSkosResourceCfModal implements ModalComponent<NewSkosResourceCfModalData> {
    context: NewSkosResourceCfModalData;

    @ViewChild("toFocus") inputToFocus: ElementRef;

    private resourceClass: ARTURIResource;
    private customFormId: string;

    //standard form
    private label: string;
    private lang: string;
    private uri: string;

    //custom form
    private formFields: FormField[] = [];

    constructor(public dialog: DialogRef<NewSkosResourceCfModalData>, 
        private cfService: CustomFormsServices,
        private modalService: ModalServices, 
        private browsingService: BrowsingServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.lang = this.context.lang;
        this.resourceClass = this.context.cls;
        this.customFormId = this.context.cfId;
    }

    ngAfterViewInit() {
        this.inputToFocus.nativeElement.focus();
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

    private changeClass() {
        this.browsingService.browseClassTree("Change class", [this.resourceClass]).then(
            (selectedClass: any) => {
                if ((<ARTURIResource>selectedClass).getURI() != this.resourceClass.getURI()) {
                    this.resourceClass = selectedClass;
                     this.cfService.getCustomConstructors(this.resourceClass).subscribe(
                        customForms => {
                            if (customForms.length == 0) { //empty form collection
                                this.customFormId = null;
                            } else if (customForms.length == 1) {
                                this.customFormId = customForms[0].getId(); 
                            } else { //(forms.length > 1) //let user choose
                                return this.modalService.selectCustomForm("Update form constructor", customForms).then(
                                    (selectedCF: any) => {
                                        this.customFormId = (<CustomForm>selectedCF).getId();
                                    },
                                    () => {}
                                );
                            }
                        }
                    );
                }
            },
            () => {}
        )
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

        var returnedData: { uriResource: ARTURIResource, label: ARTLiteral, cls: ARTURIResource, cfId: string, cfValueMap: any} = {
            uriResource: null,
            label: new ARTLiteral(this.label, null, this.lang),
            cls: this.resourceClass,
            cfId: this.customFormId,
            cfValueMap: entryMap
        }
        //Set URI only if localName is not empty
        if (this.uri != null && this.uri.trim() != "") {
            returnedData.uriResource = new ARTURIResource(this.uri);
        }
        this.dialog.close(returnedData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}