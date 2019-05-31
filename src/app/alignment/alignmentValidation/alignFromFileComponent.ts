import { Component } from '@angular/core';
import { AlignmentOverview } from '../../models/Alignment';
import { AlignmentServices } from '../../services/alignmentServices';
import { UIUtils } from '../../utils/UIUtils';
import { AbstractAlignSource } from './abstractAlignSource';

@Component({
    selector: 'alignment-file',
    templateUrl: './alignFromFileComponent.html',
})
export class AlignFromFileComponent extends AbstractAlignSource {

    private alignmentFile: File;
    private sourceBaseURI: string;
    private targetBaseURI: string;

    constructor(private alignmentService: AlignmentServices) {
        super();
    }

    /**
     * Updates the file to load when user change file on from filepicker
     */
    private fileChangeEvent(file: File) {
        this.alignmentFile = file;
    }

    /**
     * Loads the alignment file and the mapping cells
     */
    private loadAlignment() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.alignmentService.loadAlignment(this.alignmentFile).subscribe(
            (overview: AlignmentOverview) => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.sourceBaseURI = overview.onto1;
                this.targetBaseURI = overview.onto2;
                this.updateRelationSymbols(overview);
                this.alignmentLoaded.emit(overview);
            }
        );
    }

}