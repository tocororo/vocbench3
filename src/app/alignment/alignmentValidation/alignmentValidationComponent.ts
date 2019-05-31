import { Component, HostListener } from '@angular/core';
import { AlignmentServices } from '../../services/alignmentServices';
import { HttpServiceContext } from '../../utils/HttpManager';
import { AlignmentOverview } from '../../models/Alignment';

@Component({
    selector: 'alignment-validation-component',
    templateUrl: './alignmentValidationComponent.html',
    host: { class: "pageComponent" }
})
export class AlignmentValidationComponent {

    private sourceFile: string = "File";
    private sourceGenoma: string = "Genoma task";
    private alignmentSources: string[] = [this.sourceFile, this.sourceGenoma];
    private selectedSource: string;


    private alignmentOverview: AlignmentOverview;

    constructor(private alignmentService: AlignmentServices) {}

    ngOnInit() {
        HttpServiceContext.initSessionToken();
    }

    //use HostListener instead of ngOnDestroy since this component is reused and so it is never destroyed
    @HostListener('window:beforeunload', [ '$event' ])
    beforeUnloadHandler(event: Event) {
        // close session server side
        this.alignmentService.closeSession().subscribe();
    }

    private onSourceChange() {
        this.alignmentOverview = null;
    }

}