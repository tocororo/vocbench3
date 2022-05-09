import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../models/ARTResources";
import { User } from "../models/User";
import { ResourceUtils } from "../utils/ResourceUtils";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType } from '../widget/modal/Modals';
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { OperationSelectModal } from "./modals/operationSelectModal";

@Component({
    selector: "history-filter",
    templateUrl: "./historyFilterComponent.html"
})
export class HistoryFilterComponent {

    @Input() operations: ARTURIResource[];
    @Input() performers: User[];
    @Input() fromTime: string;
    @Input() toTime: string;
    //Useful in order to hide Performers filter from Validation page when user is not validator (it is forced to see only its commits) */
    @Input() hidePerformers: boolean;

    @Output() apply: EventEmitter<{ operations: ARTURIResource[], performers: User[], fromTime: string, toTime: string }> = new EventEmitter();

    constructor(private modalService: NgbModal, private sharedModals: SharedModalServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        if (this.operations == null) {
            this.operations = [];
        }
    }

    selectOperationFilter() {
        this.modalService.open(OperationSelectModal, new ModalOptions()).result.then(
            (operations: any) => {
                //for each operation to add, add it only if not already in operations array
                operations.forEach((op: ARTURIResource) => {
                    if (!ResourceUtils.containsNode(this.operations, op)) {
                        this.operations.push(op);
                    }
                });
            },
            () => { }
        );
    }

    private removeOperationFilter(operation: ARTURIResource) {
        this.operations.splice(this.operations.indexOf(operation), 1);
    }

    private selectOperationPerformer() {
        this.sharedModals.selectUser({ key: "ACTIONS.SELECT_USER" }, true).then(
            (user: User) => {
                for (let i = 0; i < this.performers.length; i++) {
                    if (this.performers[i].getIri().equals(user.getIri())) {
                        return; //user already in
                    }
                }
                this.performers.push(user);
            },
            () => { }
        );
    }

    private removeOperationPerformer(user: User) {
        this.performers.splice(this.performers.indexOf(user), 1);
    }

    applyFilter() {
        let timeRegexp: RegExp = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$");
        if (this.fromTime != null && !timeRegexp.test(this.fromTime)) {
            this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_FROM_TIME_FORMAT" }, ModalType.error);
            return;
        }
        if (this.toTime != null && !timeRegexp.test(this.toTime)) {
            this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_TO_TIME_FORMAT" }, ModalType.error);
            return;
        }
        this.apply.emit({ operations: this.operations, performers: this.performers, fromTime: this.fromTime, toTime: this.toTime });
    }

}