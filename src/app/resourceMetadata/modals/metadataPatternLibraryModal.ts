import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { PatternStruct, ResourceMetadataUtils } from "../../models/ResourceMetadata";
import { ResourceMetadataServices } from "../../services/resourceMetadataServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class MetadataPatternLibraryModalData extends BSModalContext {
    constructor(public title: string, public patternToShare: PatternStruct, public existinPatterns: PatternStruct[]) {
        super();
    }
}

@Component({
    selector: "metadata-pattern-library-modal",
    templateUrl: "./metadataPatternLibraryModal.html",
})
export class MetadataPatternLibraryModal implements ModalComponent<MetadataPatternLibraryModalData> {
    context: MetadataPatternLibraryModalData;

    private patterns: PatternStruct[];
    private selectedPattern: PatternStruct;

    private name: string;
    private nameTooltip: string;

    private deletePatternAuthorized: boolean;

    constructor(public dialog: DialogRef<MetadataPatternLibraryModalData>, private resourceMetadataService: ResourceMetadataServices,
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //init auth
        this.deletePatternAuthorized = true;

        if (this.context.patternToShare != null) { //sharing a pattern (from project to system)
            this.name = this.context.patternToShare.name;
            this.nameTooltip = "The name to assign to the shared Pattern";
        } else { //importing a pattern (from system to project)
            this.nameTooltip = "The name to assign to the imported Pattern";
        }

        this.resourceMetadataService.getSharedPatternIdentifiers().subscribe(
            refs => {
                this.patterns = refs.map(ref => ResourceMetadataUtils.convertReferenceToPatternStruct(ref));
            }
        )
    }

    isOkEnabled(): boolean {
        if (this.context.patternToShare != null) { //sharing pattern => check if name is provided
            return this.name != null && this.name.trim() != "";
        } else { //import shared pattern => check if a patten is selected
            return this.selectedPattern != null;
        }
    }

    private sharePatternImpl() {
        this.resourceMetadataService.sharePattern(this.context.patternToShare.reference, this.name).subscribe(
            () => {
                this.cancel(); //so the invoking component doesn't refresh the UI
            }
        );
    }

    private importPatternImpl() {
        this.resourceMetadataService.importSharedPattern(this.selectedPattern.reference, this.name).subscribe(
            () => {
                this.dialog.close(); //so the invoking component refreshes the UI
            }
        );
    }

    ok() {
        if (this.context.patternToShare != null) { //sharing pattern => store the same pattern at system level
            //check if there is another shared pattern with the given name
            if (this.patterns.some(p => p.name == this.name)) {
                this.basicModals.confirm(this.context.title, "A shared Pattern with the same name already exists. It will be replaced. Do you want to continue?", "warning").then(
                    () => this.sharePatternImpl(),
                    () => {}
                )
            } else {
                this.sharePatternImpl();
            }
        } else { //import shared pattern => clone the same pattern at project level
            //check if there is another project pattern with the same name
            if (this.context.existinPatterns.some(p => p.name == this.name)) {
                this.basicModals.confirm(this.context.title, "A Pattern with the same name already exists. It will be replaced. Do you want to continue?", "warning").then(
                    () => this.importPatternImpl(),
                    () => {}
                )
            } else {
                this.importPatternImpl();
            }
        }
        
    }

    cancel() {
        this.dialog.dismiss();
    }
}