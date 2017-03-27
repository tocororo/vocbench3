import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {FormField} from "../../models/CustomForms";
import {RDFResourceRolesEnum} from "../../models/ARTResources";
import {VBContext} from "../../utils/VBContext";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ModalServices} from "../../widget/modal/modalServices";
import {CustomFormsServices} from "../../services/customFormsServices";

export class CustomFormModalData extends BSModalContext {
    /**
     * @param title title of the dialog
     * @param creId custom range entry ID
     */
    constructor(
        public title: string,
        public cfId: string
    ) {
        super();
    }
}

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "custom-form-modal",
    templateUrl: "./customFormModal.html",
})
export class CustomFormModal implements ModalComponent<CustomFormModalData> {
    context: CustomFormModalData;

    private ontoType: string;
    
    private formFields: FormField[];
    private submittedWithError: boolean = false;
    
    constructor(public dialog: DialogRef<CustomFormModalData>, public cfService: CustomFormsServices, public browsingService: BrowsingServices,
        private modalService: ModalServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        this.ontoType = VBContext.getWorkingProject().getPrettyPrintOntoType();
        this.cfService.getCustomFormRepresentation(this.context.cfId).subscribe(
            form => {
                this.formFields = form
                /*initialize formEntries in order to adapt it to the view set checked at true to
                all formEntries. (It wouldn't be necessary for all the entries but just for those optional*/
                for (var i = 0; i < this.formFields.length; i++) {
                    this.formFields[i]['checked'] = true;
                }
            },
            err => {
                this.modalService.alert("Error", "Impossible to create the CustomForm (" + this.context.cfId 
                        + "). Its description may contains error. " + err, "error").then(
                    res => { this.dialog.dismiss(); }
                )
            }
        )
    }

    private isProjectSKOS() {
        return this.ontoType.includes('SKOS');
    }
    
    /**
     * Listener to change of lang-picker used to set the language argument of a formField that
     * has coda:langString as converter
     */
    private onConverterLangChange(newLang: string, formFieldConvArgument: FormField) {
        /* setTimeout to trigger a new round of change detection avoid an exception due to changes in a lifecycle hook
        (see https://github.com/angular/angular/issues/6005#issuecomment-165911194) */
        window.setTimeout(() =>
            formFieldConvArgument['value'] = newLang
        );
    }
    
    /**
     * Listener on change of a formField input field. Checks if there are some other
     * formEntries with the same userPrompt and eventually updates their value
     */
    private onEntryValueChange(value: string, formField: FormField) {
        for (var i = 0; i < this.formFields.length; i++) {
            if (this.formFields[i] != formField && this.formFields[i].getUserPrompt() == formField.getUserPrompt()) {
                this.formFields[i]['value'] = value;
            }
        }
    }

    private pickExistingReource(role: RDFResourceRolesEnum, formField: FormField) {
        if (role == RDFResourceRolesEnum.cls) {
            this.browsingService.browseClassTree("Select a Class").then(
                (selectedResource: any) => {
                    formField['value'] = selectedResource.getNominalValue();
                },
                () => {}
            );
        } else if (role == RDFResourceRolesEnum.individual) {
            this.browsingService.browseClassIndividualTree("Select an Instance").then(
                (selectedResource: any) => {
                    formField['value'] = selectedResource.getNominalValue();
                },
                () => {}
            );
        } else if (role == RDFResourceRolesEnum.concept) {
            this.browsingService.browseConceptTree("Select a Concept").then(
                (selectedResource: any) => {
                    formField['value'] = selectedResource.getNominalValue();
                },
                () => {}
            );
        } else if (role == RDFResourceRolesEnum.conceptScheme) {
            this.browsingService.browseSchemeList("Select a ConceptScheme").then(
                (selectedResource: any) => {
                    formField['value'] = selectedResource.getNominalValue();
                },
                () => {}
            );
        } else if (role == RDFResourceRolesEnum.skosCollection) {
            this.browsingService.browseCollectionTree("Select a Collection").then(
                (selectedResource: any) => {
                    formField['value'] = selectedResource.getNominalValue();
                },
                () => {}
            );
        } else if (role == RDFResourceRolesEnum.property) {
            this.browsingService.browsePropertyTree("Select a Property").then(
                (selectedResource: any) => {
                    formField['value'] = selectedResource.getNominalValue();
                },
                () => {}
            );
        } 
    }
    
    ok(event: Event) {
        //check if all required field are filled
        for (var i = 0; i < this.formFields.length; i++) {
            var entry = this.formFields[i];
            if (entry['checked'] && (entry['value'] == undefined || (entry['value'] instanceof String && entry['value'].trim() == ""))) {
                this.submittedWithError = true;
                return;
            }
        }
        
        var entryMap: Array<any> = []; //{userPrompt: string, value: string}
        for (var i = 0; i < this.formFields.length; i++) {
            var entry = this.formFields[i];
            if (entry['checked']) {
                //add the entry only if not already in
                var alreadyIn: boolean = false;
                for (var j = 0; j < entryMap.length; j++) {
                    if (entryMap[j].userPrompt == entry.getUserPrompt()) {
                        alreadyIn = true;
                        break;
                    }
                }
                if (!alreadyIn) {
                    entryMap.push({userPrompt: entry.getUserPrompt(), value: entry['value']});
                }
            }
        }
        
        event.stopPropagation();
        this.dialog.close(entryMap);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}