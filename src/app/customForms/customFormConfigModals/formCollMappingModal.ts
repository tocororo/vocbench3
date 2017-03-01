import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {CustomFormsServices} from "../../services/customFormsServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ARTURIResource} from "../../models/ARTResources";

@Component({
    selector: "form-coll-mapping-modal",
    templateUrl: "./formCollMappingModal.html",
})
export class FormCollMappingModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;
    
    private formCollectionList: Array<string>;
    private selectedResource: ARTURIResource;
    private selectedFormColl: string;
    
    constructor(public dialog: DialogRef<BSModalContext>, private cfService: CustomFormsServices,
        private browsingService: BrowsingServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        this.cfService.getAllFormCollections().subscribe(
            crList => {
                this.formCollectionList = crList;
            }
        );
    }
    
    private selectProperty() {
        this.browsingService.browsePropertyTree("Select a property").then(
            (prop: any) => {
                this.selectedResource = prop;
            },
            () => {}
        )
    }

    private selectClass() {
        this.browsingService.browseClassTree("Select a class").then(
            (cls: any) => {
                this.selectedResource = cls;
            },
            () => {}
        )
    }
    
    private selectFormColl(formColl: string) {
        this.selectedFormColl = formColl;
    }
    
    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close({resource: this.selectedResource, formCollection: this.selectedFormColl});
    }

    cancel() {
        this.dialog.dismiss();
    }
}