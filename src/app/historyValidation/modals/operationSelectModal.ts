import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ServicesServices } from '../../services/servicesServices';
import { ARTURIResource } from '../../models/ARTResources';

@Component({
    selector: "operation-select-modal",
    templateUrl: "./operationSelectModal.html",
})
export class OperationSelectModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private NOT_SELECTED: string = "---";

    private extensionPaths: string[] = [];
    private selectedExtensionPath: string;
    private serviceClasses: string[] = [this.NOT_SELECTED];
    private selectedServiceClasses: string;
    private operations: { service: string, checked: boolean, filtered: boolean }[] = [];
    private operationsToAdd: string[] = [];

    private filterKey: string;

    constructor(public dialog: DialogRef<BSModalContext>, private servicesService: ServicesServices) {
        this.context = dialog.context;
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

    private onExtPathChange() {
        this.servicesService.getServiceClasses(this.selectedExtensionPath).subscribe(
            serviceClasses => {
                this.serviceClasses = this.serviceClasses.concat(serviceClasses);
            }
        );
    }

    private onServClassChange() {
        if (this.selectedServiceClasses == this.NOT_SELECTED) {
            this.operations = [];
            return;
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
    private addOperations() {
        this.operations.forEach(op => {
            if (op.checked) {
                if (this.operationsToAdd.indexOf(op.service) == -1) {
                    this.operationsToAdd.push(op.service);
                }
            }
        });
        this.operationsToAdd.sort(
            function (op1: string, op2: string) {
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
        for (var i = 0; i < this.operationsToAdd.length; i++) {
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
            var show: string;
            var splitted: string[] = operation.split("/");
            show = splitted[splitted.length - 2];
            show += "/" + splitted[splitted.length - 1];
            return show;
        } else {
            return operation.substring(operation.lastIndexOf("/")+1);
        }
        
    }

    private onFilterChanged() {
        for (var i = 0; i < this.operations.length; i++) {
            if (this.getOperationShow(this.operations[i].service).toLowerCase().includes(this.filterKey.toLowerCase())) {
                this.operations[i].filtered = false;
            } else {
                this.operations[i].filtered = true;
            }
        }
    }

    ok(event: Event) {
        var returnedOperations: ARTURIResource[] = [];

        this.operationsToAdd.forEach(op => {
            returnedOperations.push(new ARTURIResource(op, this.getOperationShow(op, true)));
        });

        if (returnedOperations.length == 0) {
            this.cancel();
        }

        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(returnedOperations);
    }

    cancel() {
        this.dialog.dismiss();
    }

}
