import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class PrefixNamespaceModalContent {
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
    ) {}
}

@Component({
    selector: "mapping-modal",
    templateUrl: "app/src/config/dataManagement/metadata/prefixNamespaceModal.html",
})
export class PrefixNamespaceModal implements ICustomModalComponent {
    
    private prefix: string;
    private namespace: string;
    
    dialog: ModalDialogInstance;
    context: PrefixNamespaceModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <PrefixNamespaceModalContent>modelContentData;
        this.prefix = this.context.prefix;
        this.namespace = this.context.namespace;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
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