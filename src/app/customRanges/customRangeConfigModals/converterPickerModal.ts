import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {CustomRangeServices} from "../../services/customRangeServices"

export class ConverterPickerModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string,
    ) {
        super();
    }
}

/**
 * Modal that allows to choose among a set of options
 */
@Component({
    selector: "converter-picker-modal",
    templateUrl: "./converterPickerModal.html",
})
export class ConverterPickerModal implements ModalComponent<ConverterPickerModalData> {
    context: ConverterPickerModalData;
    
    private converters: {description: string; name: string; rdfCapability: string; uri: string;}[];
    private converterSelected: {description: string; name: string; rdfCapability: string; uri: string;};
    
    constructor(public dialog: DialogRef<ConverterPickerModalData>, private crService: CustomRangeServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.crService.listConverterContracts().subscribe(
            converterList => {
                this.converters = converterList;
            }
        );
    }

    private selectConverter(converter: {description: string; name: string; rdfCapability: string; uri: string;}) {
        if (converter == this.converterSelected) {
            this.converterSelected = null;
        } else {
            this.converterSelected = converter;
        }
    }

    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close(this.converterSelected);
    }

    cancel() {
        this.dialog.dismiss();
    }
}