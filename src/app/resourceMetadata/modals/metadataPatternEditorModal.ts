import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents, Reference } from "../../models/Configuration";
import { Scope, ScopeUtils } from "../../models/Plugins";
import { PearlValidationResult } from "../../models/Coda";
import { ResourceMetadataPatternDefinition } from "../../models/ResourceMetadata";
import { ConfigurationsServices } from "../../services/configurationsServices";
import { ResourceMetadataServices } from "../../services/resourceMetadataServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { CODAServices } from "../../services/codaServices";
import { Observable } from "rxjs";

export class MetadataPatternEditorModalData extends BSModalContext {
    constructor(public title: string, public ref?: Reference, public readOnly?: boolean) {
        super();
    }
}

@Component({
    selector: "metadata-pattern-editor-modal",
    templateUrl: "./metadataPatternEditorModal.html",
})
export class MetadataPatternEditorModal implements ModalComponent<MetadataPatternEditorModalData> {
    context: MetadataPatternEditorModalData;

    private scopes: Scope[];
    private selectedScope: Scope;

    private name: string; //used as id of the configuration
    private description: string;

    private pearlEditors: PearlEditorStruct[] = [
        { type: PearlEditorEnum.Construction, code: null, validation: { valid: true }, timer: null },
        { type: PearlEditorEnum.Update, code: null, validation: { valid: true }, timer: null },
        { type: PearlEditorEnum.Destruction, code: null, validation: { valid: true }, timer: null, 
            info: "Please notice that when the resource is deleted, all of its outgoing triples will be automatically deleted, " + 
                "so developing a destruction pattern is necessary only in case there are other resources connected only to this " + 
                "resource that should be deleted in turn"
        },
    ];
    private activePearlEditor: PearlEditorStruct = this.pearlEditors[0];

    constructor(public dialog: DialogRef<MetadataPatternEditorModalData>, private resourceMetadataService: ResourceMetadataServices,
        private codaService: CODAServices, private configurationService: ConfigurationsServices, 
        private basicModals: BasicModalServices, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngOnInit() {
        UIUtils.setFullSizeModal(this.elementRef);

        this.configurationService.getConfigurationManager(ConfigurationComponents.RESOURCE_METADATA_PATTERN_STORE).subscribe(
            cfgMgr => {
                this.scopes = cfgMgr.configurationScopes;
                this.selectedScope = cfgMgr.scope;
                if (this.context.ref != null) { //edit
                    this.resourceMetadataService.getPattern(this.context.ref.relativeReference).subscribe(
                        patternConf => {
                            this.name = this.context.ref.identifier;
                            this.selectedScope = this.context.ref.getReferenceScope();
                            // this.name = patternConf.getPropertyValue("name");
                            this.description = patternConf.getPropertyValue("description");
                            this.pearlEditors.find(ps => ps.type == PearlEditorEnum.Construction).code = patternConf.getPropertyValue("construction");
                            this.pearlEditors.find(ps => ps.type == PearlEditorEnum.Update).code = patternConf.getPropertyValue("update");
                            this.pearlEditors.find(ps => ps.type == PearlEditorEnum.Destruction).code = patternConf.getPropertyValue("destruction");
                        }
                    );
                }
            }
        );
    }

    private onPearlChanged(pearlEditor: PearlEditorStruct) {
        clearTimeout(pearlEditor.timer);
        pearlEditor.timer = window.setTimeout(() => { this.validatePearl(pearlEditor) }, 1000);
    }

    private validatePearl(pearlEditor: PearlEditorStruct) {
        if (pearlEditor.code == null || pearlEditor.code.trim() == "") {
            pearlEditor.validation = { valid: true };
        } else {
            this.codaService.validatePearl(pearlEditor.code).subscribe(
                result => {
                    pearlEditor.validation = result;
                }
            );
        }
    }

    private isDataValid(): boolean {
        return this.name != null && this.name.trim() != "";
    }

    ok() {
        //check if at least one pearl is provided
        if (!this.pearlEditors.some(ps => ps.code != null && ps.code.trim() != "")) {
            this.basicModals.alert("Missing pattern", "You need to provide at least one pattern (Construction, Update or Destruction)");
            return;
        }
        //check if pattern are valid
        if (this.pearlEditors.some(p => !p.validation.valid)) {
            this.basicModals.alert("Invalid pattern", "One (or more) pattern is not valid. Please fix it and retry");
            return;
        }

        let pattern: ResourceMetadataPatternDefinition = {};
        if (this.description != null) {
            pattern.description = this.description;
        }
        let constructionPearl: string = this.pearlEditors.find(ps => ps.type == PearlEditorEnum.Construction).code;
        if (constructionPearl != null && constructionPearl != "") {
            pattern.construction = constructionPearl;
        }
        let updatePearl: string = this.pearlEditors.find(ps => ps.type == PearlEditorEnum.Update).code;
        if (updatePearl != null && updatePearl != "") {
            pattern.update = updatePearl;
        }
        let destructionPearl: string = this.pearlEditors.find(ps => ps.type == PearlEditorEnum.Destruction).code;
        if (destructionPearl != null && destructionPearl != "") {
            pattern.destruction = destructionPearl;
        }
        if (this.context.ref != null) { //update
            this.resourceMetadataService.updatePattern(this.context.ref.relativeReference, pattern).subscribe(
                () => {
                    this.dialog.close();
                }
            )
        } else { //create
            this.resourceMetadataService.createPattern(ScopeUtils.serializeScope(this.selectedScope) + ":" + this.name, pattern).subscribe(
                () => {
                    this.dialog.close();
                }
            )
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
}

enum PearlEditorEnum {
    Construction = "Construction",
    Update = "Update",
    Destruction = "Destruction"
}

interface PearlEditorStruct {
    type: PearlEditorEnum;
    code: string;
    validation: PearlValidationResult;
    timer: number;
    info?: string;
}