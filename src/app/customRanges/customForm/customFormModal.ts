import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
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
        this.keyboard = null;
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
    
    private formEntries: FormEntry[];
    private submittedWithError: boolean = false;
    
    constructor(public dialog: DialogRef<CustomFormModalData>, public crService: CustomRangeServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        this.crService.getCustomRangeEntryForm(this.context.creId).subscribe(
            form => {
                this.formEntries = form
                /*initialize formEntries in order to adapt it to the view set checked at true to
                all formEntries. (It wouldn't be necessary for all the entries but just for those optional*/
                for (var i = 0; i < this.formEntries.length; i++) {
                    this.formEntries[i]['checked'] = true;
                }
            }
        )
    }
    
    /**
     * Listener to change of lang-picker used to set the language argument of a FormEntry that
     * has coda:langString as converter
     */
    private onConverterLangChange(newLang: string, formEntryConvArgument: FormEntry) {
        /* setTimeout to trigger a new round of change detection avoid an exception due to changes in a lifecycle hook
        (see https://github.com/angular/angular/issues/6005#issuecomment-165911194) */
        window.setTimeout(() =>
            formEntryConvArgument['value'] = newLang
        );
    }
    
    /**
     * Listener on change of a formEntry input field. Checks if there are some other
     * formEntries with the same userPrompt and eventually updates their value
     */
    private onEntryValueChange(value: string, formEntry: FormEntry) {
        for (var i = 0; i < this.formEntries.length; i++) {
            if (this.formEntries[i] != formEntry && this.formEntries[i].getUserPrompt() == formEntry.getUserPrompt()) {
                this.formEntries[i]['value'] = value;
            }
        }
    }
    
    ok(event) {
        //check if all required field are filled
        for (var i = 0; i < this.formEntries.length; i++) {
            var entry = this.formEntries[i];
            if (entry['checked'] && (entry['value'] == undefined || (entry['value'] instanceof String && entry['value'].trim() == ""))) {
                this.submittedWithError = true;
                return;
            }
        }
        
        var entryMap: Array<any> = []; //{userPrompt: string, value: string}
        for (var i = 0; i < this.formEntries.length; i++) {
            var entry = this.formEntries[i];
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