import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { PatternStruct, ResourceMetadataUtils } from "../../models/ResourceMetadata";
import { ResourceMetadataServices } from "../../services/resourceMetadataServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "metadata-pattern-library-modal",
    templateUrl: "./metadataPatternLibraryModal.html",
})
export class MetadataPatternLibraryModal {
    @Input() title: string;
    @Input() patternToShare: PatternStruct;
    @Input() existinPatterns: PatternStruct[];

    patterns: PatternStruct[];
    selectedPattern: PatternStruct;

    name: string;
    nameTooltip: string;

    deletePatternAuthorized: boolean;

    constructor(public activeModal: NgbActiveModal, private resourceMetadataService: ResourceMetadataServices,
        private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        //init auth
        this.deletePatternAuthorized = true;

        if (this.patternToShare != null) { //sharing a pattern (from project to system)
            this.name = this.patternToShare.name;
            this.nameTooltip = "The name to assign to the shared Pattern";
        } else { //importing a pattern (from system to project)
            this.nameTooltip = "The name to assign to the imported Pattern";
        }

        this.initLibrary();
    }

    private initLibrary() {
        this.resourceMetadataService.getLibraryPatternIdentifiers().subscribe(
            refs => {
                this.patterns = refs.map(ref => ResourceMetadataUtils.convertReferenceToPatternStruct(ref));
                this.selectedPattern = null;
            }
        )
    }

    deletePattern() {
        this.basicModals.confirm({key:"RESOURCE_METADATA.ACTIONS.DELETE_METADATA_PATTERN"}, {key:"MESSAGES.DELETE_SHARED_METADATA_PATTERN_CONFIRM"}, ModalType.warning).then(
            () => {
                this.resourceMetadataService.deletePattern(this.selectedPattern.reference).subscribe(
                    () => {
                        this.initLibrary();
                    }
                )
            },
            () => {}
        )
    }

    private storePatternInLibraryImpl() {
        this.resourceMetadataService.storePatternInLibrary(this.patternToShare.reference, this.name).subscribe(
            () => {
                this.cancel(); //so the invoking component doesn't refresh the UI
            }
        );
    }

    private importPatternImpl() {
        this.resourceMetadataService.importPatternFromLibrary(this.selectedPattern.reference, this.name).subscribe(
            () => {
                this.activeModal.close(); //so the invoking component refreshes the UI
            }
        );
    }

    isOkEnabled(): boolean {
        if (this.patternToShare != null) { //sharing pattern => check if name is provided
            return this.name != null && this.name.trim() != "";
        } else { //import shared pattern => check if a patten is selected
            return this.selectedPattern != null;
        }
    }

    ok() {
        if (this.patternToShare != null) { //sharing pattern => store the same pattern at system level
            //check if there is another shared pattern with the given name
            if (this.patterns.some(p => p.name == this.name)) {
                this.basicModals.confirm(this.title, {key:"MESSAGES.REPLACE_SHARED_METADATA_PATTERN_CONFIRM"}, ModalType.warning).then(
                    () => this.storePatternInLibraryImpl(),
                    () => {}
                )
            } else {
                this.storePatternInLibraryImpl();
            }
        } else { //import shared pattern => clone the same pattern at project level
            //check if there is another project pattern with the same name
            if (this.existinPatterns.some(p => p.name == this.name)) {
                this.basicModals.confirm(this.title, {key:"MESSAGES.REPLACE_METADATA_PATTERN_CONFIRM"}, ModalType.warning).then(
                    () => this.importPatternImpl(),
                    () => {}
                )
            } else {
                this.importPatternImpl();
            }
        }
        
    }

    cancel() {
        this.activeModal.dismiss();
    }
}