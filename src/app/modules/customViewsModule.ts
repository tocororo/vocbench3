import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CustomViewsComponent } from '../customFormView/customViews/customViewsComponent';
import { CustomViewEditorModal } from '../customFormView/customViews/editors/customViewEditorModal';
import { CvAssociationEditorModal } from '../customFormView/customViews/editors/cvAssociationEditorModal';
import { AdvSingleValueViewEditorComponent } from '../customFormView/customViews/editors/views/advSingleValueViewEditorComponent';
import { AreaViewEditorComponent } from '../customFormView/customViews/editors/views/areaViewEditorComponent';
import { DynamicVectorViewEditorComponent } from '../customFormView/customViews/editors/views/dynamicVectorViewEditorComponent';
import { PointViewEditorComponent } from '../customFormView/customViews/editors/views/pointViewEditorComponent';
import { PropertyChainViewEditorComponent } from '../customFormView/customViews/editors/views/propertyChainViewEditorComponent';
import { RouteViewEditorComponent } from '../customFormView/customViews/editors/views/routeViewEditorComponent';
import { SeriesCollectionViewEditorComponent } from '../customFormView/customViews/editors/views/seriesCollectionViewEditorComponent';
import { SeriesViewEditorComponent } from '../customFormView/customViews/editors/views/seriesViewEditorComponent';
import { StaticVectorViewEditorComponent } from '../customFormView/customViews/editors/views/staticVectorViewEditorComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule,
        TranslateModule
    ],
    providers: [],
    declarations: [
        CustomViewsComponent,
        CustomViewEditorModal,
        CvAssociationEditorModal,

        AdvSingleValueViewEditorComponent,
        AreaViewEditorComponent,
        DynamicVectorViewEditorComponent,
        PointViewEditorComponent,
        PropertyChainViewEditorComponent,
        RouteViewEditorComponent,
        SeriesViewEditorComponent,
        SeriesCollectionViewEditorComponent,
        StaticVectorViewEditorComponent,
    ],
    exports: [CustomViewsComponent],
    entryComponents: [
        CustomViewEditorModal,
        CvAssociationEditorModal,
    ]
})
export class CustomViewsModule { }