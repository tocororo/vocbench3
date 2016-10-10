import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";

export class PrefixNamespaceModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param prefix the prefix to change. Optional, to provide only to change a mapping.
     * @param namespace the namespace to change. Optional, to provide only to change a mapping.
     * @param namespaceReadonly tells if namespace value can be changed
     */
    constructor(
        public title: string = "Modal Title",
        public prefix: string,
        public namespace: string,
        public namespaceReadonly: boolean = false
    ) {
        super();
    }
}

@Component({
    selector: "mapping-modal",
    templateUrl: "./prefixNamespaceModal.html",
})
export class PrefixNamespaceModal implements ModalComponent<PrefixNamespaceModalData> {
    context: PrefixNamespaceModalData;
    
    private prefix: string;
    private namespace: string;

    constructor(public dialog: DialogRef<PrefixNamespaceModalData>) {
        this.context = dialog.context;
        this.prefix = this.context.prefix;
        this.namespace = this.context.namespace;
    }
    
    /**
     * Useful to enable/disable ok button. Inputs are valid if they are not null and if one of them is changed
     */
    private isInputValid() {
        var prefixValid = (this.prefix && this.prefix.trim() != "");
        var namespaceValid = (this.namespace && this.namespace.trim() != "");
        var prefixChanged = (this.prefix != this.context.prefix);
        var namespaceChanged = (this.namespace != this.context.namespace);
        return (prefixValid && namespaceValid && (prefixChanged || namespaceChanged));
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close({prefix: this.prefix, namespace: this.namespace});
    }

    cancel() {
        this.dialog.dismiss();
    }

}