import { Component, Input, ViewChild, ElementRef, SimpleChanges } from "@angular/core";
import { Modal } from 'angular2-modal/plugins/bootstrap';
import { ARTResource, ARTURIResource, ResAttribute, ResourceUtils } from "../models/ARTResources";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { RefactorServices } from "../services/refactorServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator"

@Component({
    selector: "resource-rename",
    templateUrl: "./resourceRenameComponent.html",
})
export class ResourceRenameComponent {

    @Input() resource: ARTResource;
    @Input() readonly: boolean;

    @ViewChild('localrenameinput') localRenameInput: ElementRef;
    @ViewChild('totalrenameinput') totalRenameInput: ElementRef;

    private renameDisabled: boolean = true;
 
    private localName: string;
    private pristineNamespace: string;
    private pristineLocalName: string;

    private renameLocked = true;
    private namespaceLocked = true;

    constructor(private refactorService: RefactorServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        if (this.resource.isURIResource()) {
            this.localName = (<ARTURIResource>this.resource).getLocalName();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource'] && changes['resource'].currentValue) {
            if (this.resource.isURIResource()) {
                this.localName = (<ARTURIResource>this.resource).getLocalName();
            }
            //rename disabled if resource is not explicit || resView is readOnly || user has not the authorization || resource is to validate
            this.renameDisabled = (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) || this.readonly || 
                !AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.REFACTOR_CHANGE_RESOURCE_URI, this.resource) ||
			    ResourceUtils.isReourceInStaging(this.resource));
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
                this.basicModals.alert("Rename", "You have to write a valid local name", "error");
                this.cancelRename()
                return;
            }
            newUri = (<ARTURIResource>this.resource).getBaseURI() + this.localName;
        } else { //complete renaming (ns + localName)
            newUri = this.totalRenameInput.nativeElement.value;
            if (newUri.trim() == "") {
                this.basicModals.alert("Rename", "You have to write a valid URI", "error");
                this.cancelRename()
                return;
            }
        }
        if ((<ARTURIResource>this.resource).getURI() != newUri) { //if the uri has changed
            this.refactorService.changeResourceURI(<ARTURIResource>this.resource, new ARTURIResource(newUri)).subscribe(
                stResp => {
                    this.renameLocked = true;
                    this.namespaceLocked = true;
                },
                err => {
                    this.cancelRename();
                }
            );
        } else {
            this.cancelRename();
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
            this.basicModals.alert("Copy resource URI", "Resource URI copied in clipboard!");
        } catch (err) {
            this.basicModals.alert("Copy resource URI", "Unable to copy the resource URI in the clipboard");
        } finally {
            document.body.removeChild(textArea);
        }
    }

}