import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {FormEntry} from "../../utils/CustomRanges";
import {CustomRangeServices} from "../../services/customRangeServices";

export class CustomFormModalData extends BSModalContext {
    /**
     * @param title title of the dialog
     * @param creId custom range entry ID
     */
    constructor(
        public title: string,
        public creId: string
    ) {
        super();
    }
}

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "custom-form-modal",
    templateUrl: "app/src/customRanges/customForm/customFormModal.html",
    providers: [CustomRangeServices]
})
export class CustomFormModal implements ModalComponent<CustomFormModalData> {
    context: CustomFormModalData;
    
    private formEntries: FormEntry[];
    private submittedWithError: boolean = false;
    
    //TODO: handle CRE with type node
    
    constructor(public dialog: DialogRef<CustomFormModalData>, public crService: CustomRangeServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        this.crService.getCustomRangeEntryForm(this.context.creId).subscribe(
            form => {
                this.formEntries = form
                /*initialize formEntries in order to adapt it to the view
                set checked at true to all formEntries. This is not necessary for all the entries
                but just for those optional*/
                for (var i = 0; i < this.formEntries.length; i++) {
                    this.formEntries[i]['checked'] = true;
                }
            }
        )
        document.getElementById("toFocus").focus();
    }
    
    ok(event) {
        //check if all required field are filled
        for (var i = 0; i < this.formEntries.length; i++) {
            var entry = this.formEntries[i];
            if (entry['checked'] && (entry['value'] == undefined || entry['value'].trim() == "")) {
                this.submittedWithError = true;
                return;
            }
        }
        
        var entryMap: Array<any> = [];
        for (var i = 0; i < this.formEntries.length; i++) {
            var entry = this.formEntries[i];
            if (entry['checked']) {
                entryMap.push({userPrompt: entry.getUserPrompt(), value: entry['value']});
            }
        }
        
        event.stopPropagation();
        this.dialog.close(entryMap);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}