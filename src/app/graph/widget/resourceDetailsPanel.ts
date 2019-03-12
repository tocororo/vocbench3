import { Component, Input } from '@angular/core';
import { ARTNode, ARTResource } from '../../models/ARTResources';
import { SharedModalServices } from '../../widget/modal/sharedModal/sharedModalServices';

@Component({
    selector: 'resource-details-panel',
    templateUrl: './resourceDetailsPanel.html'
})
export class ResourceDetailsPanel {

    @Input() resource: ARTNode;

    constructor(private sharedModals: SharedModalServices) { }

    private showResourceView() {
        this.sharedModals.openResourceView(<ARTResource>this.resource, false);
    }

}