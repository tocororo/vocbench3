import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { D3Service } from '../graph/d3/d3Services';
import { DraggableDirective } from '../graph/d3/draggableDirective';
import { ZoomableDirective } from '../graph/d3/zoomableDirective';
import { GraphPanel } from '../graph/graphPanel';
import { DataGraphComponent } from '../graph/impl/dataGraphComponent';
import { DataNodeComponent } from '../graph/impl/dataNodeComponent';
import { LinkComponent } from '../graph/impl/linkComponent';
import { ModelGraphComponent } from '../graph/impl/modelGraphComponent';
import { NodeModelComponent } from '../graph/impl/modelNodeComponent';
import { GraphModal } from "../graph/modal/graphModal";
import { GraphModalServices } from '../graph/modal/graphModalServices';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        LinkComponent, NodeModelComponent, DataNodeComponent, DraggableDirective, ZoomableDirective,
        GraphPanel, ModelGraphComponent, DataGraphComponent,
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