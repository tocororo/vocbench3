import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { PearlValidationResult } from "../../models/Coda";
import { Reference } from "../../models/Configuration";
import { Scope, ScopeUtils } from "../../models/Plugins";
import { PatternStruct, ResourceMetadataPatternDefinition } from "../../models/ResourceMetadata";
import { CODAServices } from "../../services/codaServices";
import { ResourceMetadataServices } from "../../services/resourceMetadataServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "metadata-pattern-editor-modal",
    templateUrl: "./metadataPatternEditorModal.html",
})
export class MetadataPatternEditorModal {
    @Input() title: string;
    @Input() existingPatterns: PatternStruct[];
    @Input() ref: string;
    @Input() readOnly: boolean;

    name: string; //used as id of the configuration
    description: string;

    pearlEditors: PearlEditorStruct[] = [
        { type: PearlEditorEnum.Construction, code: null, validation: { valid: true }, timer: null },
        { type: PearlEditorEnum.Update, code: null, validation: { valid: true }, timer: null },
        { type: PearlEditorEnum.Destruction, code: null, validation: { valid: true }, timer: null },
    ];
    private activePearlEditor: PearlEditorStruct = this.pearlEditors[0];

    constructor(public activeModal: NgbActiveModal, private resourceMetadataService: ResourceMetadataServices,
        private codaService: CODAServices, private basicModals: BasicModalServices, private elementRef: ElementRef) {
    }

    ngOnInit() {
        UIUtils.setFullSizeModal(this.elementRef);

        if (this.ref != null) { //edit
            this.resourceMetadataService.getPattern(this.ref).subscribe(
                patternConf => {
                    this.name = Reference.getRelativeReferenceIdentifier(this.ref);
                    this.description = patternConf.getPropertyValue("description");
                    this.pearlEditors.find(ps => ps.type == PearlEditorEnum.Construction).code = patternConf.getPropertyValue("construction");
                    this.pearlEditors.find(ps => ps.type == PearlEditorEnum.Update).code = patternConf.getPropertyValue("update");
                    this.pearlEditors.find(ps => ps.type == PearlEditorEnum.Destruction).code = patternConf.getPropertyValue("destruction");
                }
            );
        }
    }

    private onPearlChanged(pearlEditor: PearlEditorStruct) {
        clearTimeout(pearlEditor.timer);
        pearlEditor.timer = window.setTimeout(() => { this.validatePearl(pearlEditor); }, 1000);
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

    isDataValid(): boolean {
        return this.name != null && this.name.trim() != "";
    }

    ok() {
        //check if at least one pearl is provided
        if (!this.pearlEditors.some(ps => ps.code != null && ps.code.trim() != "")) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.METADATA_PATTERN_REQUIRED" }, ModalType.warning);
            return;
        }
        //check if pattern are valid
        if (this.pearlEditors.some(p => !p.validation.valid)) {
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "MESSAGES.INVALID_METADATA_PATTERN" }, ModalType.warning);
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
        if (this.ref != null) { //update
            this.resourceMetadataService.updatePattern(this.ref, pattern).subscribe(
                () => {
                    this.activeModal.close();
                }
            );
        } else { //create
            //in creation check if a pattern with the same name exists
            if (this.existingPatterns.some(p => p.name == this.name)) {
                this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.ALREADY_EXISTING_METADATA_PATTERN_NAME" }, ModalType.warning);
                return;
            }
            let ref = ScopeUtils.serializeScope(Scope.PROJECT) + ":" + this.name; //store pattern at project level
            this.resourceMetadataService.createPattern(ref, pattern).subscribe(
                () => {
                    this.activeModal.close();
                }
            );
        }
    }

    cancel() {
        this.activeModal.dismiss();
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
}