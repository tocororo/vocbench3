import { HttpClient } from "@angular/common/http";
import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs";
import { MetadataServices } from "src/app/services/metadataServices";
import { ModalType } from 'src/app/widget/modal/Modals';
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "mapping-modal",
    templateUrl: "./prefixNamespaceModal.html",
})
export class PrefixNamespaceModal {
    @Input() title: string;
    @Input() prefixInput: string;
    @Input() namespaceInput: string;
    @Input() namespaceReadonly: boolean;
    //tells if the services for changing/adding the mapping should be invoked by the dialog. If false, the dialog simply returns the mapping
    @Input() write: boolean;

    prefix: string;
    namespace: string;

    constructor(public activeModal: NgbActiveModal, private metadataService: MetadataServices,
        private basicModals: BasicModalServices, private httpClient: HttpClient) { }

    ngOnInit() {
        this.prefix = this.prefixInput;
        this.namespace = this.namespaceInput;
    }

    isPrefixCCResolutionEnabled() {
        //one of prefix or namespace is provided
        return this.prefix != null && this.prefix.trim() != "" || this.namespace != null && this.namespace.trim() != "";
    }

    resolveWithPrefixCC() {
        if (this.prefix != null && this.prefix.trim() != "") { //prefix provided => resolve namespace
            this.resolveNamespaceWithPrefixCC();
        } else if (this.namespace != null && this.namespace.trim() != "") { //prefix not provided, namespace provided => resolve prefix
            this.resolvePrefixWithPrefixCC();
        }
    }

    private resolvePrefixWithPrefixCC() {
        this.httpClient.get("http://prefix.cc/reverse?uri=" + this.namespace + "&format=json").subscribe(
            prefixMap => {
                for (let p in prefixMap) {
                    if (prefixMap[p] == this.namespace) {
                        this.prefix = p;
                        break;
                    }
                }
            }
        );
    }

    private resolveNamespaceWithPrefixCC() {
        this.httpClient.get("http://prefix.cc/" + this.prefix + ".file.json").subscribe(
            prefixMap => {
                for (let p in prefixMap) {
                    if (p == this.prefix) {
                        this.namespace = prefixMap[p];
                        break;
                    }
                }
            }
        );
    }

    /**
     * Useful to enable/disable ok button. Inputs are valid if they are not null and if one of them is changed
     */
    isInputValid() {
        let prefixValid = (this.prefix && this.prefix.trim() != "");
        let namespaceValid = (this.namespace && this.namespace.trim() != "");
        let prefixChanged = (this.prefix != this.prefixInput);
        let namespaceChanged = (this.namespace != this.namespaceInput);
        return (prefixValid && namespaceValid && (prefixChanged || namespaceChanged));
    }

    ok() {
        if (this.write) {
            let editFn: Observable<void>;
            if (this.namespaceInput != null) { //edit mapping
                editFn = this.metadataService.changeNSPrefixMapping(this.prefix, this.namespace);
            } else { //create mapping
                editFn = this.metadataService.setNSPrefixMapping(this.prefix, this.namespace);
            }
            editFn.subscribe(
                () => {
                    this.activeModal.close({ prefix: this.prefix, namespace: this.namespace });
                },
                (error: Error) => {
                    if (error.name.endsWith("InvalidPrefixException")) {
                        this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_PREFIX" }, ModalType.warning);
                    }
                }
            );
        } else { //simply close the dialog and returns the mapping
            this.activeModal.close({ prefix: this.prefix, namespace: this.namespace });
        }

    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export interface PrefixNamespaceModalData {
    prefix: string;
    namespace: string;
}