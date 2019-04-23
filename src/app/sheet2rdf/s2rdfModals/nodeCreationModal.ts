import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs";
import { ARTURIResource, RDFTypesEnum } from "../../models/ARTResources";
import { CODAConverter, NodeConversion, SimpleHeader } from "../../models/Sheet2RDF";
import { CODAServices } from "../../services/codaServices";
import { RangeType } from "../../services/propertyServices";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class NodeCreationModalData extends BSModalContext {
    /**
     * @param header header for which it is creating the node
     * @param rangeType range type of the property chosen in the graph application. Useful to determine the compliant converters
     * @param language the language chosen in the graph application.
     * @param datatype datatype chosen in the graph application. Useful to determine the compliant converter
     * @param headerNodes nodes already defined for the header. Useful to check if the current header has already a node with the same id
     */
    constructor(
        public header: SimpleHeader,
        public rangeType: RangeType,
        public language: string,
        public datatype: ARTURIResource, 
        public headerNodes: NodeConversion[]
    ) {
        super();
    }
}

@Component({
    selector: "node-creation-modal",
    templateUrl: "./nodeCreationModal.html",
})
export class NodeCreationModal implements ModalComponent<NodeCreationModalData> {
    context: NodeCreationModalData;

    private nodeId: string;

    private selectedConverter: CODAConverter;
    private memoize: boolean = false;

    constructor(public dialog: DialogRef<NodeCreationModalData>, private s2rdfService: Sheet2RDFServices, private codaService: CODAServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        document.getElementById("toFocus").focus();
        // this.nodeId = this.context.header.pearlFeature + "_node";
    }

    private onConverterUpdate(updateStatus: { converter: CODAConverter, memoize: boolean }) {
        this.selectedConverter = updateStatus.converter;
        this.memoize = updateStatus.memoize;
    }

    /**
     * Ok is enabled if
     * - node id is provided (and it is valid)
     * - converter is selected
     * - all the parameters (if any) of the converter signature are provided
     * - the further info of the default literal converter (if selected) are provided
     */
    private isOkEnabled() {
        let isSignatureOk: boolean = true;
        if (this.selectedConverter != null) {
            for (let key in this.selectedConverter.params) {
                let paramValue = this.selectedConverter.params[key];
                if (paramValue != null) { //param not null, check if it is ok according its type
                    if (typeof paramValue === "string" && paramValue.trim() == "") { //string must not be empty
                        isSignatureOk = false;
                    } else if (Array.isArray(paramValue)) { //array must not be empty or populated with empty value
                        if (paramValue.length == 0) {
                            isSignatureOk = false;
                        } else {
                            paramValue.forEach(v => {
                                if (v == null) {
                                    isSignatureOk = false;
                                }
                            });
                        }
                    } else if (typeof paramValue == "object") { //map must not have empty value
                        if (JSON.stringify(paramValue) == "{}") { //empty object
                            isSignatureOk = false;
                        } else {
                            for (let key in <any>paramValue) {
                                if (key == null || paramValue[key] == null) {
                                    isSignatureOk = false;
                                }
                            }
                        }
                    }
                } else { //param null
                    isSignatureOk = false;
                }
            }
        }
        return (
            this.nodeId != null && this.nodeId.trim() != "" &&
            this.selectedConverter != null &&
            isSignatureOk
        );
    }

    private isNodeAlreadyInUse(nodeId: string): Observable<boolean> {
        for (let n of this.context.headerNodes) {
            if (n.nodeId == nodeId) {
                return Observable.of(true);
            }
        }
        //if this code is reached, the id is not used locally in the header => check globally invoking the server
        return this.s2rdfService.isNodeIdAlreadyUsed(nodeId);
    }

    ok() {
        this.isNodeAlreadyInUse(this.nodeId).subscribe(
            used => {
                if (used) {
                    this.basicModals.alert("Node creation", "Id '" + this.nodeId + "' is already used for another node", "warning");
                    return;
                }
                let newNode: NodeConversion = { nodeId: this.nodeId, converter: this.selectedConverter, memoize: this.memoize }
                this.dialog.close(newNode);
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}

class HeaderRangeType {
    type: RDFTypesEnum;
    show: string;
}