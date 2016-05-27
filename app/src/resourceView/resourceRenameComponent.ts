import {Component, Input} from "@angular/core";
import {Modal} from 'angular2-modal/plugins/bootstrap';
import {ARTResource, ARTURIResource} from "../utils/ARTResources";
import {SanitizerDirective} from "../utils/directives/sanitizerDirective";
import {ModalServices} from "../widget/modal/modalServices";
import {RefactorServices} from "../services/refactorServices";

@Component({
    selector: "resource-rename",
    templateUrl: "app/src/resourceView/resourceRenameComponent.html",
    directives: [SanitizerDirective],
    providers: [RefactorServices],
})
export class ResourceRenameComponent {
    
    @Input() resource: ARTResource;
    
    private renameLocked = true;
    
    constructor(private refactorService: RefactorServices, private modalService: ModalServices) {}
    
    /** 
     * Enable and focus the input text to rename the resource 
     */  
    private startRename(inputEl: HTMLElement) {
        inputEl.focus();
        this.renameLocked = false;
    }
    
    /**
     * Cancel the renaming of the resource and restore the original UI
     */
    private cancelRename(inputEl: HTMLInputElement) {
        //here I can cast resource to ARTURIResource (since rename is enabled only for ARTURIResource and not for ARTBNode)
        inputEl.value = (<ARTURIResource>this.resource).getLocalName();
        this.renameLocked = true;
    }
    
    /**
     * Apply the renaming of the resource and restore the original UI
     */
    private renameResource(inputEl: HTMLInputElement) {
        //here I can cast resource to ARTURIResource (since rename is enabled only for ARTURIResource and not for ARTBNode)
        this.renameLocked = true;
        var newLocalName = inputEl.value;
        if (newLocalName.trim() == "") {
            this.modalService.alert("Rename", "You have to write a valid local name", "error");
            inputEl.value = (<ARTURIResource>this.resource).getLocalName();
            return;
        }
        var newUri = (<ARTURIResource>this.resource).getBaseURI() + newLocalName;
        if ((<ARTURIResource>this.resource).getURI() != newUri) { //if the uri has changed
            this.refactorService.changeResourceURI(<ARTURIResource>this.resource, newUri).subscribe();    
        }
    }
    
    /**
     * Since URI of URIResource is splitted in namespace and localName, this method allows
     * to copy the complete URI in the clipboard. It uses a workaround described here
     * http://stackoverflow.com/a/30810322/5805661
     */
    private copyToClipboard() {
        var textArea = document.createElement("textarea");
        //this method is called by clicking on a button visible only if the resource is a URIResource, so cast is safe
        textArea.value = (<ARTURIResource>this.resource).getURI();
        document.body.appendChild(textArea);
        textArea.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            this.modalService.alert("Copy resource URI", "Resource URI copied in clipboard!");
        } catch (err) {
            this.modalService.alert("Copy resource URI", "Unable to copy the resource URI in the clipboard");
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
}