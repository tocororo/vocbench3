import { Component } from '@angular/core';
import { AlignmentOverview } from '../../models/Alignment';
import { AlignmentServices } from '../../services/alignmentServices';
import { UIUtils } from '../../utils/UIUtils';
import { AlignFromSource } from './alignFromSource';

@Component({
    selector: 'alignment-file',
    templateUrl: './alignFromFileComponent.html',
    host: { class: "vbox" }
})
export class AlignFromFileComponent extends AlignFromSource {

    private alignmentFile: File;
    private sourceBaseURI: string;
    private targetBaseURI: string;

    constructor(private alignmentService: AlignmentServices) {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
    }

    /**
     * Updates the file to load when user change file on from filepicker
     */
    private fileChangeEvent(file: File) {
        this.alignmentFile = file;
        this.loadAlignment();
    }

    /**
     * Loads the alignment file and the mapping cells
     */
    private loadAlignment() {
        //restore initial status
        this.sourceBaseURI = null;
        this.targetBaseURI = null;

        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.alignmentService.loadAlignment(this.alignmentFile).subscribe(
            (overview: AlignmentOverview) => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.sourceBaseURI = overview.onto1;
                this.targetBaseURI = overview.onto2;

                this.alignmentOverview = overview;
            }
        );
    }

}