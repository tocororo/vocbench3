import {Component, Input, ViewChild} from "@angular/core";
import {Modal} from 'angular2-modal/plugins/bootstrap';
import {ARTResource, ARTURIResource} from "../utils/ARTResources";
import {SanitizerDirective} from "../utils/directives/sanitizerDirective";
import {ModalServices} from "../widget/modal/modalServices";
import {RefactorServices} from "../services/refactorServices";

@Component({
    selector: "resource-rename",
    templateUrl: "app/src/resourceView/resourceRenameComponent.html",
    directives: [SanitizerDirective],
})
export class ResourceRenameComponent {
    
    @Input() resource: ARTResource;
    
    @ViewChild('localrenameinput') localRenameInput;
    @ViewChild('totalrenameinput') totalRenameInput;
    
    private localName: string;
    private pristineNamespace: string;
    private pristineLocalName: string;
    
    private renameLocked = true;
    private namespaceLocked = true;
    
    constructor(private refactorService: RefactorServices, private modalService: ModalServices) {}
    
    ngOnInit() {
        if (this.resource.isURIResource()) {
            this.localName = (<ARTURIResource>this.resource).getLocalName();
        }
    }
    
    /** 
     * Enable and focus the input text to rename the resource 
     */  
    private startRename() {
        this.localRenameInput.nativeElement.focus();
        this.renameLocked = false;
    }
    
    /**
     * Cancel the renaming of the resource and restore the original UI
     */
    private cancelRename() {
        //here I can cast resource to ARTURIResource (since rename is enabled only for ARTURIResource and not for ARTBNode)
        this.localName = (<ARTURIResource>this.resource).getLocalName(); //restore the local name
        this.renameLocked = true;
        this.namespaceLocked = true;
    }
    
    private blockNamespace() {
        this.namespaceLocked = !this.namespaceLocked;
    }
    
    /**
     * Apply the renaming of the resource and restore the original UI
     */
    private renameResource() {
        var newUri: string;
        //here I can cast resource to ARTURIResource (since rename is enabled only for ARTURIResource and not for ARTBNode)
        if (this.namespaceLocked) { //just the namespace has changed
            if (this.localName.trim() == "") {
                this.modalService.alert("Rename", "You have to write a valid local name", "error");
                this.cancelRename()
                return;
            }
            newUri = (<ARTURIResource>this.resource).getBaseURI() + this.localName;
        } else { //complete renaming (ns + localName)
            newUri = this.totalRenameInput.nativeElement.value;
            if (newUri.trim() == "") {
                this.modalService.alert("Rename", "You have to write a valid URI", "error");
                this.cancelRename()
                return;
            }
        }
        if ((<ARTURIResource>this.resource).getURI() != newUri) { //if the uri has changed
            this.refactorService.changeResourceURI(<ARTURIResource>this.resource, newUri).subscribe(
                stResp => {
                    this.renameLocked = true;
                    this.namespaceLocked = true;
                },
                err => {
                    this.cancelRename();
                }
            );
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