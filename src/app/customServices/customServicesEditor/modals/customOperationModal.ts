import { Component } from "@angular/core";
import { DialogRef, Modal, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { Configuration } from "../../../models/Configuration";
import { CustomOperation, CustomOperationDefinition, CustomOperationTypes, OperationParameter, OperationType, SPARQLOperation, TypeUtils } from "../../../models/CustomService";
import { QueryChangedEvent } from "../../../models/Sparql";
import { CustomServiceServices } from "../../../services/customServiceServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { AuthorizationHelperModal, AuthorizationHelperModalData } from "./authorizationHelperModal";
var $: JQueryStatic = require('jquery');

export class CustomOperationModalData extends BSModalContext {
    /**
     * @param title 
     * @param operation
     */
    constructor(public operation: CustomOperationDefinition) {
        super();
    }
}

@Component({
    selector: "custom-operation-modal",
    templateUrl: "./customOperationModal.html",
})
export class CustomOperationModal implements ModalComponent<CustomOperationModalData> {
    context: CustomOperationModalData;

    private title: string;

    constructor(public dialog: DialogRef<CustomOperationModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.title = this.context.operation.name;
    }


    ok() {
        this.dialog.close();
    }

    
}