import { Component, HostListener } from '@angular/core';
import { AlignmentServices } from '../../services/alignmentServices';
import { HttpServiceContext } from '../../utils/HttpManager';

@Component({
    selector: 'alignment-validation-component',
    templateUrl: './alignmentValidationComponent.html',
    host: { class: "pageComponent" }
})
export class AlignmentValidationComponent {

    private sourceFile: string = "File";
    private sourceRemoteSystem: string = "Remote Alignment System";
    private alignmentSources: string[] = [this.sourceFile, this.sourceRemoteSystem];
    private selectedSource: string;

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

}