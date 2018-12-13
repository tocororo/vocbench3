import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { D3Service } from '../graph/d3/d3Services';
import { DraggableDirective } from '../graph/d3/draggableDirective';
import { ZoomableDirective } from '../graph/d3/zoomableDirective';
import { GraphPanel } from '../graph/graphPanel';
import { ExplorationGraphComponent } from '../graph/impl/explorationGraphComponent';
import { GraphComponent } from '../graph/impl/graphComponent';
import { GraphModal } from "../graph/modal/graphModal";
import { GraphModalServices } from '../graph/modal/graphModalServices';
import { LinkComponent } from '../graph/impl/linkComponent';
import { NodeDataComponent } from '../graph/impl/nodeDataComponent';
import { NodeModelComponent } from '../graph/impl/nodeModelComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        LinkComponent, NodeModelComponent, NodeDataComponent, DraggableDirective, ZoomableDirective,
        GraphPanel, GraphComponent, ExplorationGraphComponent,
        //modals
        GraphModal
    ],
    exports: [],
    providers: [ D3Service, GraphModalServices ],
    entryComponents: [
        GraphModal
    ]
})
export class GraphModule { }