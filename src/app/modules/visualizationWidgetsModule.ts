import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { WidgetAssociationEditorModal } from '../visualizationWidgets/editors/widgetAssociationEditorModal';
import { WidgetEditorModal } from '../visualizationWidgets/editors/widgetEditorModal';
import { VisualizationWidgetsComponent } from '../visualizationWidgets/visualizationWidgetsComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        SharedModule,
        TranslateModule,
    ],
    providers: [],
    declarations: [
        VisualizationWidgetsComponent,
        WidgetAssociationEditorModal,
        WidgetEditorModal,
    ],
    exports: [
        VisualizationWidgetsComponent
    ],
    entryComponents: [
        WidgetAssociationEditorModal,
        WidgetEditorModal,
    ]
})
export class VisualizationWidgetsModule { }