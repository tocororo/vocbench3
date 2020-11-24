import { HttpClient } from "@angular/common/http";
import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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
    
    prefix: string;
    namespace: string;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices, private httpClient: HttpClient) {}

    ngOnInit() {
        this.prefix = this.prefixInput;
        this.namespace = this.namespaceInput;
    }

    resolveWithPrefixCC() {
        if (this.namespace == null || this.namespace.trim() == "") {
            this.basicModals.alert("Resolve prefix", "Namespace must be provided.", ModalType.warning);
            return;
        }
        this.httpClient.get("https://prefix.cc/reverse?uri=" + this.namespace + "&format=json").subscribe(
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
    
    /**
     * Useful to enable/disable ok button. Inputs are valid if they are not null and if one of them is changed
     */
    isInputValid() {
        var prefixValid = (this.prefix && this.prefix.trim() != "");
        var namespaceValid = (this.namespace && this.namespace.trim() != "");
        var prefixChanged = (this.prefix != this.prefixInput);
        var namespaceChanged = (this.namespace != this.namespaceInput);
        return (prefixValid && namespaceValid && (prefixChanged || namespaceChanged));
    }

    ok() {
        this.activeModal.close({prefix: this.prefix, namespace: this.namespace});
    }

    cancel() {
        this.activeModal.dismiss();
    }

}