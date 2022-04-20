import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Reference } from "src/app/models/Configuration";
import { AdvSingleValueViewDefinition, AreaViewDefinition, CustomViewCategory, CustomViewConst, CustomViewDefinition, CustomViewDefinitionKeys, CustomViewModel, CustomViewReference, DynamicVectorViewDefinition, PointViewDefinition, PropertyChainViewDefinition, RouteViewDefinition, SeriesCollectionViewDefinition, SeriesViewDefinition, StaticVectorViewDefinition } from "src/app/models/CustomViews";
import { Scope, ScopeUtils } from "src/app/models/Plugins";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { UIUtils } from "../../utils/UIUtils";
import { AbstractCustomViewEditor } from "./views/abstractCustomViewEditor";
import { AdvSingleValueViewEditorComponent } from "./views/advSingleValueViewEditorComponent";
import { AreaViewEditorComponent } from "./views/areaViewEditorComponent";
import { DynamicVectorViewEditorComponent } from "./views/dynamicVectorViewEditorComponent";
import { PointViewEditorComponent } from "./views/pointViewEditorComponent";
import { PropertyChainViewEditorComponent } from "./views/propertyChainViewEditorComponent";
import { RouteViewEditorComponent } from "./views/routeViewEditorComponent";
import { SeriesCollectionViewEditorComponent } from "./views/seriesCollectionViewEditorComponent";
import { SeriesViewEditorComponent } from "./views/seriesViewEditorComponent";
import { StaticVectorViewEditorComponent } from "./views/staticVectorViewEditorComponent";

@Component({
    selector: "custom-view-editor-modal",
    templateUrl: "./customViewEditorModal.html",
})
export class CustomViewEditorModal {
    @Input() title: string;
    @Input() existingCV: CustomViewReference[];
    @Input() ref: string;
    @Input() readOnly: boolean;

    @ViewChild("areaEditor") areaEditor: AreaViewEditorComponent;
    @ViewChild("routeEditor") routeEditor: RouteViewEditorComponent;
    @ViewChild("pointEditor") pointEditor: PointViewEditorComponent;
    @ViewChild("seriesEditor") seriesEditor: SeriesViewEditorComponent;
    @ViewChild("seriesCollEditor") seriesCollEditor: SeriesCollectionViewEditorComponent;

    @ViewChild("propChainEditor") propChainEditor: PropertyChainViewEditorComponent;
    @ViewChild("advSingleValueEditor") advSingleValueEditor: AdvSingleValueViewEditorComponent;
    @ViewChild("staticVectorEditor") staticVectorEditor: StaticVectorViewEditorComponent;
    @ViewChild("dynamicVectorEditor") dynamicVectorEditor: DynamicVectorViewEditorComponent;

    name: string;

    categories: { id: CustomViewCategory, translationKey: string }[] = [
        { id: CustomViewCategory.single_value, translationKey: "CUSTOM_VIEWS.MODELS.SINGLE_VALUE.SINGLE_VALUE" },
        { id: CustomViewCategory.vector, translationKey: "CUSTOM_VIEWS.MODELS.VECTOR.VECTOR" },
        { id: CustomViewCategory.geospatial, translationKey: "CUSTOM_VIEWS.MODELS.GEOSPATIAL.GEOSPATIAL" },
        { id: CustomViewCategory.statistical_series, translationKey: "CUSTOM_VIEWS.MODELS.STATISTICAL_SERIES.STATISTICAL_SERIES" }
    ];
    selectedCategory: CustomViewCategory;

    //Mapping between categories and the admitted models
    models: { [category: string]: { id: CustomViewModel, translationKey: string }[] } = {
        [CustomViewCategory.single_value]: [
            { id: CustomViewModel.property_chain, translationKey: "CUSTOM_VIEWS.MODELS.SINGLE_VALUE.PROPERTY_CHAIN" },
            { id: CustomViewModel.adv_single_value, translationKey: "CUSTOM_VIEWS.MODELS.SINGLE_VALUE.ADV_SINGLE_VALUE" },
        ],
        [CustomViewCategory.vector]: [
            { id: CustomViewModel.static_vector, translationKey: "CUSTOM_VIEWS.MODELS.VECTOR.PREFEFINED_STATIC" },
            { id: CustomViewModel.dynamic_vector, translationKey: "CUSTOM_VIEWS.MODELS.VECTOR.DYNAMIC_CUSTOMIZABLE" },
        ],
        [CustomViewCategory.geospatial]: [
            { id: CustomViewModel.point, translationKey: "CUSTOM_VIEWS.MODELS.GEOSPATIAL.POINT" },
            { id: CustomViewModel.area, translationKey: "CUSTOM_VIEWS.MODELS.GEOSPATIAL.AREA" },
            { id: CustomViewModel.route, translationKey: "CUSTOM_VIEWS.MODELS.GEOSPATIAL.ROUTE" },
        ],
        [CustomViewCategory.statistical_series]: [
            { id: CustomViewModel.series, translationKey: "CUSTOM_VIEWS.MODELS.STATISTICAL_SERIES.SERIES" },
            { id: CustomViewModel.series_collection, translationKey: "CUSTOM_VIEWS.MODELS.STATISTICAL_SERIES.SERIES_COLLECTION" },
        ]
    };
    selectedModel: CustomViewModel;

    customViewDef: CustomViewDefinition;

    constructor(private customViewService: CustomViewsServices, private activeModal: NgbActiveModal, private elementRef: ElementRef) {
    }

    ngOnInit() {
        if (this.ref != null) { //edit
            this.customViewService.getCustomView(this.ref).subscribe(
                patternConf => {
                    this.name = Reference.getRelativeReferenceIdentifier(this.ref);

                    this.selectedModel = CustomViewConst.classNameToModelMap[patternConf.type];

                    if (this.selectedModel == CustomViewModel.point) {
                        let cvDef: PointViewDefinition = {
                            retrieve: patternConf.getPropertyValue(CustomViewDefinitionKeys.retrieve),
                            update: patternConf.getPropertyValue(CustomViewDefinitionKeys.update),
                            suggestedView: patternConf.getPropertyValue(CustomViewDefinitionKeys.suggestedView),
                        };
                        this.customViewDef = cvDef;
                        this.selectedCategory = CustomViewCategory.geospatial;
                    } else if (this.selectedModel == CustomViewModel.area) {
                        let cvDef: AreaViewDefinition = {
                            retrieve: patternConf.getPropertyValue(CustomViewDefinitionKeys.retrieve),
                            update: patternConf.getPropertyValue(CustomViewDefinitionKeys.update),
                            suggestedView: patternConf.getPropertyValue(CustomViewDefinitionKeys.suggestedView),
                        };
                        this.customViewDef = cvDef;
                        this.selectedCategory = CustomViewCategory.geospatial;
                    } else if (this.selectedModel == CustomViewModel.route) {
                        let cvDef: RouteViewDefinition = {
                            retrieve: patternConf.getPropertyValue(CustomViewDefinitionKeys.retrieve),
                            update: patternConf.getPropertyValue(CustomViewDefinitionKeys.update),
                            suggestedView: patternConf.getPropertyValue(CustomViewDefinitionKeys.suggestedView),
                        };
                        this.customViewDef = cvDef;
                        this.selectedCategory = CustomViewCategory.geospatial;
                    } else if (this.selectedModel == CustomViewModel.series) {
                        let cvDef: SeriesViewDefinition = {
                            retrieve: patternConf.getPropertyValue(CustomViewDefinitionKeys.retrieve),
                            update: patternConf.getPropertyValue(CustomViewDefinitionKeys.update),
                            suggestedView: patternConf.getPropertyValue(CustomViewDefinitionKeys.suggestedView),
                        };
                        this.customViewDef = cvDef;
                        this.selectedCategory = CustomViewCategory.statistical_series;
                    } else if (this.selectedModel == CustomViewModel.series_collection) {
                        let cvDef: SeriesCollectionViewDefinition = {
                            retrieve: patternConf.getPropertyValue(CustomViewDefinitionKeys.retrieve),
                            update: patternConf.getPropertyValue(CustomViewDefinitionKeys.update),
                            suggestedView: patternConf.getPropertyValue(CustomViewDefinitionKeys.suggestedView),
                        };
                        this.customViewDef = cvDef;
                        this.selectedCategory = CustomViewCategory.statistical_series;
                    } else if (this.selectedModel == CustomViewModel.property_chain) {
                        let cvDef: PropertyChainViewDefinition = {
                            properties: patternConf.getPropertyValue(CustomViewDefinitionKeys.properties),
                            suggestedView: patternConf.getPropertyValue(CustomViewDefinitionKeys.suggestedView),
                        };
                        this.customViewDef = cvDef;
                        this.selectedCategory = CustomViewCategory.single_value;
                    } else if (this.selectedModel == CustomViewModel.adv_single_value) {
                        let cvDef: AdvSingleValueViewDefinition = {
                            retrieve: patternConf.getPropertyValue(CustomViewDefinitionKeys.retrieve),
                            update: patternConf.getPropertyValue(CustomViewDefinitionKeys.update),
                            suggestedView: patternConf.getPropertyValue(CustomViewDefinitionKeys.suggestedView),
                        };
                        this.customViewDef = cvDef;
                        this.selectedCategory = CustomViewCategory.single_value;
                    } else if (this.selectedModel == CustomViewModel.static_vector) {
                        let cvDef: StaticVectorViewDefinition = {
                            suggestedView: patternConf.getPropertyValue(CustomViewDefinitionKeys.suggestedView),
                            properties: patternConf.getPropertyValue(CustomViewDefinitionKeys.properties)
                        };
                        this.customViewDef = cvDef;
                        this.selectedCategory = CustomViewCategory.vector;
                    } else if (this.selectedModel == CustomViewModel.dynamic_vector) {
                        let cvDef: DynamicVectorViewDefinition = {
                            retrieve: patternConf.getPropertyValue(CustomViewDefinitionKeys.retrieve),
                            update: patternConf.getPropertyValue(CustomViewDefinitionKeys.update),
                            suggestedView: patternConf.getPropertyValue(CustomViewDefinitionKeys.suggestedView),
                        };
                        this.customViewDef = cvDef;
                        this.selectedCategory = CustomViewCategory.vector;
                    }
                    this.adaptModalSize();
                }
            );
        }
    }

    onCategoryChanged() {
        this.selectedModel = this.models[this.selectedCategory][0].id; //when category changes, automatically select the first model available for that category
        this.onModelChanged();
    }

    onModelChanged() {
        this.customViewDef = null; //model changed => cvDef is invalid now
        this.adaptModalSize();
    }

    private adaptModalSize() {
        if (
            this.selectedModel == CustomViewModel.area || this.selectedModel == CustomViewModel.point || this.selectedModel == CustomViewModel.route ||
            this.selectedModel == CustomViewModel.series || this.selectedModel == CustomViewModel.series_collection || 
            this.selectedModel == CustomViewModel.adv_single_value || this.selectedModel == CustomViewModel.dynamic_vector
        ) {
            UIUtils.setFullSizeModal(this.elementRef);
        } else {
            UIUtils.setFullSizeModal(this.elementRef, false);
        }
    }


    onCvDefChanged(cvDef: CustomViewDefinition) {
        this.customViewDef = cvDef;
    }

    isOkEnabled() {
        return this.name && this.name.trim() != "" && this.selectedModel;
    }

    ok() {
        let activeEditor: AbstractCustomViewEditor;
        if (this.selectedModel == CustomViewModel.area) {
            activeEditor = this.areaEditor;
        } else if (this.selectedModel == CustomViewModel.route) {
            activeEditor = this.routeEditor;
        } else if (this.selectedModel == CustomViewModel.point) {
            activeEditor = this.pointEditor;
        } else if (this.selectedModel == CustomViewModel.series) {
            activeEditor = this.seriesEditor;
        } else if (this.selectedModel == CustomViewModel.series_collection) {
            activeEditor = this.seriesCollEditor;
        } else if (this.selectedModel == CustomViewModel.property_chain) {
            activeEditor = this.propChainEditor;
        } else if (this.selectedModel == CustomViewModel.adv_single_value) {
            activeEditor = this.advSingleValueEditor;
        } else if (this.selectedModel == CustomViewModel.static_vector) {
            activeEditor = this.staticVectorEditor;
        } else if (this.selectedModel == CustomViewModel.dynamic_vector) {
            activeEditor = this.dynamicVectorEditor;
        }
        if (activeEditor.isDataValid()) {
            //ref is the same provided as input (in edit mode) or built according the name entered by user (in create mode)
            let refParam = this.ref ? this.ref : ScopeUtils.serializeScope(Scope.PROJECT) + ":" + this.name; //store pattern at project level
            
            //also for edit use createCustomView which overwrite the previous with the same ref
            this.customViewService.createCustomView(refParam, this.customViewDef, this.selectedModel).subscribe(
                () => {
                    this.activeModal.close();
                }
            );
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}
