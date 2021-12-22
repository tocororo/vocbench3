import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { RDFFormat } from "src/app/models/RDFFormat";
import { RDF } from "src/app/models/Vocabulary";
import { ExportServices } from "src/app/services/exportServices";
import { VBEventHandler } from "src/app/utils/VBEventHandler";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTResource } from "../../models/ARTResources";
import { ResourcesServices } from "../../services/resourcesServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { Cookie } from "../../utils/Cookie";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "resource-triple-editor",
    templateUrl: "./resourceTripleEditorComponent.html",
    host: { class: "vbox" }
})
export class ResourceTripleEditorComponent {

    @Input() resource: ARTResource;
    @Input() readonly: boolean;
    @Input() pendingValidation: boolean;
    @Output() update: EventEmitter<ARTResource> = new EventEmitter();

    @ViewChild('blockDiv', { static: true }) blockDivElement: ElementRef;

    editAuthorized: boolean;
    description: string;

    rdfFormats: RDFFormat[];
    format: RDFFormat;

    private eventSubscriptions: Subscription[] = [];

    constructor(private resourcesService: ResourcesServices, private exportService: ExportServices, private basicModals: BasicModalServices, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(this.eventHandler.resourceUpdatedEvent.subscribe(
            (resource: ARTResource) => this.onResourceUpdated(resource)
        ));
    }

    ngOnInit() {
        //editor disabled if user has no permission to edit
        this.editAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateResourceTriplesDescription);

        let formatNameCookie: string = Cookie.getCookie(Cookie.RES_VIEW_CODE_FORMAT) || "Turtle";

        this.exportService.getOutputFormats().subscribe(
            formats => {
                this.rdfFormats = formats;
                //select Turtle as default
                for (let f of this.rdfFormats) {
                    if (f.name == formatNameCookie) {
                        this.format = f;
                    }
                }
                if (this.format == null) { //in case it has not been set (e.g. if cookie-stored format was not valid)
                    this.format = this.rdfFormats.find(f => f.name == "Turtle"); 
                }
                this.initDescription();
            }
        );

        //INIT format according cookie and store last format as cookie
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
    }

    initDescription() {
        //reinit the descriptions so that when initDescription is invoked after applyChanges, onDescriptionChange is triggered 
        this.description = null;
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);

        this.resourcesService.getOutgoingTriples(this.resource, this.format).subscribe(
            triples => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                this.description = triples;
            }
        );
    }

    onFormatChange() {
        Cookie.setCookie(Cookie.RES_VIEW_CODE_FORMAT, this.format.name);
        this.initDescription();
    }

    isApplyEnabled(): boolean {
        /* encountered too much problems comparing description with a pristine copy (initialized at the initialization of the resource description)
        so, just check that the description is not empty. Allows to apply changes even if description is not changed */
        return this.description != null && this.description.trim() != "";
    }

    applyChanges() {
        if (VBContext.getWorkingProject().isValidationEnabled() && Cookie.getCookie(Cookie.WARNING_CODE_CHANGE_VALIDATION, null, VBContext.getLoggedUser()) != "false") {
            this.basicModals.alertCheckCookie({key: "RESOURCE_VIEW.CODE_EDITOR.CODE_EDITOR"}, { key: "MESSAGES.CODE_EDITOR_VALIDATION_IGNORED_WARN" }, 
                Cookie.WARNING_CODE_CHANGE_VALIDATION).then(
                () => {
                    this.applyChangesImpl();
                }
            );
        } else {
            this.applyChangesImpl();
        }
    }

    private applyChangesImpl() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.resourcesService.updateResourceTriplesDescription(this.resource, this.description, this.format).subscribe(
            () => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                this.update.emit(this.resource);
                this.initDescription();
            },
            (err: Error) => {
                if (err.name.endsWith("IllegalArgumentException")) {
                    this.basicModals.alert({key:"STATUS.OPERATION_DENIED"}, {key:"MESSAGES.CANNOT_EDIT_DIFFERENT_RESOURCE_CODE"}, ModalType.warning);
                }
            }
        );
    }

    private onResourceUpdated(resource: ARTResource) {
        if (this.resource.equals(resource)) {
            this.initDescription();
        }
    }

}