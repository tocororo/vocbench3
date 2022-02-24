import { Component, Input, SimpleChanges } from "@angular/core";
import { Observable, of } from "rxjs";
import { ARTNode, ARTURIResource } from "src/app/models/ARTResources";
import { WidgetDataRecord } from "src/app/models/VisualizationWidgets";
import { CustomFormsServices } from "src/app/services/customFormsServices";
import { PropertyServices } from "src/app/services/propertyServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { VisualizationWidgetsServices } from "src/app/services/visualizationWidgetsServices";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";
import { ResViewPartition } from "../../../../models/ResourceView";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRendererMultiRoot } from "../partitionRendererMultiRoot";

@Component({
    selector: "widgets-renderer",
    templateUrl: "./widgetsPartitionRenderer.html",
})
export class WidgetsPartitionRenderer extends PartitionRendererMultiRoot {

    @Input() partition: ResViewPartition;
    addBtnImgSrc = "./assets/images/icons/actions/property_create.png";

    predWidgetDataList: PredWidgetDataList[] = [];

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices,
        private visualizationWidgetsService: VisualizationWidgetsServices) {
        super(resourcesService, propService, cfService, basicModals, creationModals, resViewModals);
    }


    ngOnInit() {
        super.ngOnInit();
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (changes['predicateObjectList']) {
            this.retrieveWidgetData();
        }
    }

    private retrieveWidgetData() {
        /**
         * Here in Input there is a list of ARTPredicateObjects where
         * - each predicate is, by construction, mapped to a widget (otherwise it would not have been collected in the widgets partition)
         * - each object should represent the identifier value for the widget (location for point, route_id for route/area, series_id for series, collection_id for series_collection)
         * So, for each predicate I have to retrieve the data to show in the widgets (it is the service getWidgetData itself that group the data by the id element)
         */
         this.predWidgetDataList = [];
         this.predicateObjectList.forEach(po => {
            this.visualizationWidgetsService.getWidgetData(this.resource, po.getPredicate()).subscribe(
                (data: WidgetDataRecord[]) => {
                    //convert the data to a structure <predicate> -> <widget data list>
                    this.predWidgetDataList.push({
                        predicate: po.getPredicate(),
                        widgetData: data
                    })
                }
            );

            po.getPredicate()
        })
    }

    onDoubleClick(widgetData: WidgetDataRecord) {
        this.objectDblClick(widgetData.getIdValue());
    }

    //@Override
    getPredicateToEnrich(): Observable<ARTURIResource> {
        return null;
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.enrichProperty(predicate);
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            () => {
                this.update.emit(null);
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.resourcesService.removeValue(this.resource, predicate, object);
    }

}

class PredWidgetDataList {
    predicate: ARTURIResource;
    widgetData: WidgetDataRecord[];
}