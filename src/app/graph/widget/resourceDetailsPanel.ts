import { Component, Input } from '@angular/core';
import { ARTNode } from '../../models/ARTResources';

@Component({
    selector: 'resource-details-panel',
    templateUrl: './resourceDetailsPanel.html'
})
export class ResourceDetailsPanel {

    @Input() resource: ARTNode;

    constructor() { }

}