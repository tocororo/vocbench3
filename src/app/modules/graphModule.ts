import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { D3Service } from '../graph/d3/d3Services';
import { DraggableDirective } from '../graph/d3/draggableDirective';
import { ZoomableDirective } from '../graph/d3/zoomableDirective';
import { DataGraphComponent } from '../graph/impl/dataGraphComponent';
import { DataGraphPanel } from '../graph/impl/dataGraphPanel';
import { DataNodeComponent } from '../graph/impl/dataNodeComponent';
import { LinkComponent } from '../graph/impl/linkComponent';
import { ModelGraphComponent } from '../graph/impl/modelGraphComponent';
import { ModelGraphPanel } from '../graph/impl/modelGraphPanel';
import { NodeModelComponent } from '../graph/impl/modelNodeComponent';
import { GraphModal } from "../graph/modal/graphModal";
import { GraphModalServices } from '../graph/modal/graphModalServices';
import { LinksFilterModal } from '../graph/modal/linksFilterModal';
import { ForceControlPanel } from '../graph/widget/forceControlPanel';
import { ResourceDetailsPanel } from '../graph/widget/resourceDetailsPanel';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        LinkComponent, NodeModelComponent, DataNodeComponent, DraggableDirective, ZoomableDirective,
        ModelGraphPanel, DataGraphPanel, ModelGraphComponent, DataGraphComponent,
        ForceControlPanel, ResourceDetailsPanel,
        //modals
        GraphModal, LinksFilterModal
    ],
    exports: [],
    providers: [ D3Service, GraphModalServices ],
    entryComponents: [
        GraphModal, LinksFilterModal
    ]
})
export class GraphModule { }