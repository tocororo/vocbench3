import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../models/ARTResources';
import { ServicesServices } from '../../services/servicesServices';

@Component({
    selector: "operation-select-modal",
    templateUrl: "./operationSelectModal.html",
})
export class OperationSelectModal {

    private NOT_SELECTED: string = "---";

    extensionPaths: string[] = [];
    selectedExtensionPath: string;
    serviceClasses: string[] = [this.NOT_SELECTED];
    selectedServiceClasses: string;
    operations: { service: string, checked: boolean, filtered: boolean }[] = [];
    operationsToAdd: string[] = [];

    filterKey: string;

    constructor(public activeModal: NgbActiveModal, private servicesService: ServicesServices) {
    }

    ngAfterViewInit() {
        this.servicesService.getExtensionPaths().subscribe(
            extPaths => {
                this.extensionPaths = extPaths;
                this.selectedExtensionPath = this.extensionPaths[0];
                this.onExtPathChange();
            }
        );
    }

    onExtPathChange() {
        this.servicesService.getServiceClasses(this.selectedExtensionPath).subscribe(
            serviceClasses => {
                this.serviceClasses = this.serviceClasses.concat(serviceClasses);
            }
        );
    }

    onServClassChange() {
        if (this.selectedServiceClasses == this.NOT_SELECTED) {
            this.operations = [];
        } else {
            this.servicesService.getServiceOperations(this.selectedExtensionPath, this.selectedServiceClasses).subscribe(
                operations => {
                    this.operations = [];
                    operations.forEach(op => {
                        this.operations.push({ service: op, checked: false, filtered: false });
                    });
                }
            );
        }
    }

    /**
     * Adds the checked operation to the operationsToAdd array, the sorts it
     */
    addOperations() {
        this.operations.forEach(op => {
            if (op.checked) {
                if (this.operationsToAdd.indexOf(op.service) == -1) {
                    this.operationsToAdd.push(op.service);
                }
            }
        });
        this.operationsToAdd.sort(
            (op1: string, op2: string) => {
                if (op1 > op2) return 1;
                if (op1 < op2) return -1;
                return 0;
            }
        );
    }

    /**
     * Removes the given operation from the operationToAdd array
     * @param operation
     */
    private removeOperations(operation: string) {
        for (let i = 0; i < this.operationsToAdd.length; i++) {
            if (this.operationsToAdd[i] == operation) {
                this.operationsToAdd.splice(i, 1);
                return;
            }
        }
    }

    /**
     * Returns a short form of an operation. An operation is a URI like 
     * http://semanticturkey.uniroma2.it/services/it.uniroma2.art.semanticturkey/st-core-services/<Class>/<ServiceName>
     * This method returns <Class>/<ServiceName> if includeClass is true, <ServiceName> otherwise
     * @param operation
     * @param includeClass default false
     */
    private getOperationShow(operation: string, includeClass?: boolean) {
        if (includeClass) {
            let show: string;
            let splitted: string[] = operation.split("/");
            show = splitted[splitted.length - 2];
            show += "/" + splitted[splitted.length - 1];
            return show;
        } else {
            return operation.substring(operation.lastIndexOf("/") + 1);
        }

    }

    onFilterChanged() {
        for (let i = 0; i < this.operations.length; i++) {
            if (this.getOperationShow(this.operations[i].service).toLowerCase().includes(this.filterKey.toLowerCase())) {
                this.operations[i].filtered = false;
            } else {
                this.operations[i].filtered = true;
            }
        }
    }

    ok() {
        let returnedOperations: ARTURIResource[] = [];

        this.operationsToAdd.forEach(op => {
            returnedOperations.push(new ARTURIResource(op, this.getOperationShow(op, true)));
        });

        if (returnedOperations.length == 0) {
            this.cancel();
        }

        this.activeModal.close(returnedOperations);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}
