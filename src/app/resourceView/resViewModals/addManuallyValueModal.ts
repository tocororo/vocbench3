import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTNode, ARTURIResource, ResourceUtils } from "../../models/ARTResources";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

export class AddManuallyValueData extends BSModalContext {
    /**
     * @param title modal title
     */
    constructor(
        public property: ARTURIResource,
        public propChangeable: boolean = true
    ) {
        super();
    }
}

@Component({
    selector: "add-manual-modal",
    templateUrl: "./addManuallyValueModal.html",
})
export class AddManuallyValueModal implements ModalComponent<AddManuallyValueData> {
    context: AddManuallyValueData;

    private rootProperty: ARTURIResource; //root property of the partition that invoked this modal
    private enrichingProperty: ARTURIResource;

    private inputTxt: string;
    

    constructor(public dialog: DialogRef<AddManuallyValueData>, private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        document.getElementById("toFocus").focus();
        this.rootProperty = this.context.property;
        this.enrichingProperty = this.rootProperty;
    }

    private changeProperty() {
        this.browsingModals.browsePropertyTree("Select a property", [this.rootProperty]).then(
            (selectedProp: any) => {
                this.enrichingProperty = selectedProp;
            },
            () => { }
        );
    }

    ok(event: Event) {
        let value: ARTNode;
        try {
            if (this.inputTxt.startsWith("<") && this.inputTxt.endsWith(">")) { //uri
                value = ResourceUtils.parseURI(this.inputTxt);
            } else if (this.inputTxt.startsWith("_:")) { //bnode
                value = ResourceUtils.parseBNode(this.inputTxt);
            } else if (this.inputTxt.startsWith("\"")) { //literal
                value = ResourceUtils.parseLiteral(this.inputTxt);
            } else if (ResourceUtils.isQName(this.inputTxt, VBContext.getPrefixMappings())) { //qname
                value = ResourceUtils.parseQName(this.inputTxt, VBContext.getPrefixMappings());
            } else {
                throw new Error("Not a valid N-Triples representation: " + this.inputTxt);
            }
        } catch (err) {
            this.basicModals.alert("Invalid value", err, "error");
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close({ value: value, property: this.enrichingProperty });
    }

    cancel() {
        this.dialog.dismiss();
    }

    private onKeydown(event: KeyboardEvent) {
        if (event.which == 13) {
            if (this.isInputValid()) {
                this.ok(event);
            }
        }
    }

    private isInputValid(): boolean {
        return (this.inputTxt != undefined && this.inputTxt.trim() != "");
    }

}