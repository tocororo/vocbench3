import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
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
import { DataGraphSettingsModal } from '../graph/modal/dataGraphSettingsModal';
import { GraphModal } from "../graph/modal/graphModal";
import { GraphModalServices } from '../graph/modal/graphModalServices';
import { LinksFilterModal } from '../graph/modal/linksFilterModal';
import { ForceControlPanel } from '../graph/widget/forceControlPanel';
import { ResourceDetailsPanel } from '../graph/widget/resourceDetailsPanel';
import { UmlGraphComponent } from './../graph/impl/umlGraphComponent';
import { UmlGraphPanel } from './../graph/impl/umlGraphPanel';
import { UmlLinkComponent } from './../graph/impl/umlLinkComponent';
import { UmlNodeComponent } from './../graph/impl/umlNodeComponent';
import { PreferencesModule } from './preferencesModule';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule, 
        NgbDropdownModule,
        SharedModule, 
        PreferencesModule,
        TranslateModule
    ],
    declarations: [
        LinkComponent, NodeModelComponent, DataNodeComponent, DraggableDirective, ZoomableDirective,
        ModelGraphPanel, DataGraphPanel, ModelGraphComponent, DataGraphComponent,
        ForceControlPanel, ResourceDetailsPanel,
        UmlGraphComponent,UmlGraphPanel,UmlNodeComponent,UmlLinkComponent,
        //modals
        GraphModal, LinksFilterModal, DataGraphSettingsModal
    ],
    exports: [],
    providers: [ D3Service, GraphModalServices ],
    entryComponents: [
        GraphModal, LinksFilterModal, DataGraphSettingsModal
    ]
})
export class GraphModule { }