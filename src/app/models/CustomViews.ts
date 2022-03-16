import { Deserializer } from "../utils/Deserializer";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource, RDFTypesEnum } from "./ARTResources";
import { Configuration, Reference } from "./Configuration";
import { Scope } from "./Plugins";


// ============= VIEWS =============

export class CustomViewConfiguration extends Configuration {}

export interface CustomViewDefinition {
    suggestedView: ViewsEnum;
}
export interface SparqlBasedCustomViewDefinition extends CustomViewDefinition {
    retrieve: string;
    update?: string;
}
export interface PropertiesBasedViewDefinition extends CustomViewDefinition {
    properties: string[]; //list of properties in NT
}

export interface PointViewDefinition extends SparqlBasedCustomViewDefinition {}
export interface AreaViewDefinition extends SparqlBasedCustomViewDefinition {}
export interface RouteViewDefinition extends SparqlBasedCustomViewDefinition {}
export interface SeriesViewDefinition extends SparqlBasedCustomViewDefinition {}
export interface SeriesCollectionViewDefinition extends SparqlBasedCustomViewDefinition {}

export interface PropertyChainViewDefinition extends PropertiesBasedViewDefinition {}

export interface AdvSingleValueViewDefinition extends CustomViewDefinition {
    retrieve: string;
    update: SingleValueUpdate;
}

export interface StaticVectorViewDefinition extends PropertiesBasedViewDefinition {}

export interface DynamicVectorViewDefinition extends CustomViewDefinition {
    retrieve: string;
    update: SingleValueUpdate[];
}

export interface SingleValueUpdate {
    field: string;
    updateMode: ValueUpdateMode; //tells if and how the new value can be edited/chosen (through a resource picker or with edit inline)
    updateQuery?: string;
    valueType?: RDFTypesEnum.resource | RDFTypesEnum.literal;
    datatype?: string; //NT IRI representation
    classes?: string[]; //NT IRI representation
}

export enum ValueUpdateMode {
    none = "none",
    picker = "picker",
    inline = "inline"
}

export enum CustomViewDefinitionKeys {
    properties = "properties",
    retrieve = "retrieve",
    suggestedView = "suggestedView",
    update = "update",
}

export class CustomViewReference {
    reference: string; //complete relative reference (scope:name)
    scope: Scope; //project for project-local, system for system-wide shared, factory for factory-provided
    name: string; //the identifier from the reference

    /**
     * parse/convert a plain reference to a CustomViewReference object
     * @param reference 
     * @returns 
     */
    static parseCustomViewReference(reference: string): CustomViewReference {
        return {
            reference: reference,
            scope: Reference.getRelativeReferenceScope(reference),
            name: Reference.getRelativeReferenceIdentifier(reference)
        }
    }
}

// ==== stuff for editor

export enum CustomViewCategory {
    single_value = "single_value",
    vector = "vector",
    geospatial = "geospatial",
    statistical_series = "statistical_series"
}

export enum CustomViewModel {
    //for category single values
    property_chain = "property_chain",
    adv_single_value = "adv_single_value",
    //for category vectors
    static_vector = "static_vector",
    dynamic_vector = "dynamic_vector",
    //for geospatial
    area = "area",
    point = "point",
    route = "route",
    //for statistical series
    series = "series",
    series_collection = "series_collection"
}

export enum ViewsEnum {
    map = "map",
    pie = "pie",
    bar = "bar",
    line = "line",
    single_value = "single_value",
    table = "table"
}

export class CustomViewConst {

    /**
     * Mapping between the classname (on ST) and the model of CV
     */
    static readonly classNameToModelMap: { [className: string]: CustomViewModel } = {
        "it.uniroma2.art.semanticturkey.config.customview.AreaView": CustomViewModel.area,
        "it.uniroma2.art.semanticturkey.config.customview.PointView": CustomViewModel.point,
        "it.uniroma2.art.semanticturkey.config.customview.RouteView": CustomViewModel.route,
        "it.uniroma2.art.semanticturkey.config.customview.SeriesView": CustomViewModel.series,
        "it.uniroma2.art.semanticturkey.config.customview.SeriesCollectionView": CustomViewModel.series_collection,
        "it.uniroma2.art.semanticturkey.config.customview.PropertyChainView": CustomViewModel.property_chain,
        "it.uniroma2.art.semanticturkey.config.customview.AdvSingleValueView": CustomViewModel.adv_single_value,
        "it.uniroma2.art.semanticturkey.config.customview.StaticVectorView": CustomViewModel.static_vector,
        "it.uniroma2.art.semanticturkey.config.customview.DynamicVectorView": CustomViewModel.dynamic_vector,
    }

    /**
     * Mapping between the model of CV and the available view types
     */
    static readonly modelToViewMap: { [model: string]: { id: ViewsEnum, translationKey: string }[] } = {
        [CustomViewModel.adv_single_value]: [{ id: ViewsEnum.single_value, translationKey: "Single value" }],
        [CustomViewModel.property_chain]: [{ id: ViewsEnum.single_value, translationKey: "Single value" }],
        [CustomViewModel.static_vector]: [{ id: ViewsEnum.table, translationKey: "Table" }],
        [CustomViewModel.dynamic_vector]: [{ id: ViewsEnum.table, translationKey: "Table" }],
        [CustomViewModel.point]: [{ id: ViewsEnum.map, translationKey: "Map" }],
        [CustomViewModel.area]: [{ id: ViewsEnum.map, translationKey: "Map" }],
        [CustomViewModel.route]: [{ id: ViewsEnum.map, translationKey: "Map" }],
        [CustomViewModel.series]: [
            { id: ViewsEnum.bar, translationKey: "Bar chart" },
            { id: ViewsEnum.pie, translationKey: "Pie chart" }
        ],
        [CustomViewModel.series_collection]: [{ id: ViewsEnum.line, translationKey: "Line chart" }]
    }

}

export enum CustomViewVariables {
    latitude = "?latitude", //in area, route, point
    location = "?location",  //in area, route, point
    longitude = "?longitude", //in area, route, point
    name = "?name", //in series, series_collection
    route_id = "?route_id", //in area, route
    series_id = "?series_id", //in series
    series_label = "?series_label", //in series, series_collection
    series_collection_id = "?series_collection_id", //in series_collection
    series_name = "?series_name", //in series_collection
    show = "?show", //in adv_single_value
    value = "?value", //in series, series_collection, adv_single_value
    value_label = "?value_label", //in series, series_collection
    //reserved one
    resource = "$resource",
    trigprop = "$trigprop",
}

// ============= ASSOCIATIONS =============

export interface CustomViewAssociation {
    ref: string; 
    property: ARTURIResource;
    customViewRef: CustomViewReference;
}

export class CustomViewAssociationDefinition {
    property: ARTURIResource;
    customViewRef: string;
    defaultView: ViewsEnum;
}



// ============= DATA =============


export class CustomViewDataRecord {
    
    model: CustomViewModel;
    bindingsList: BindingMapping[]; //list of mappings binding -> value

    constructor(model: CustomViewModel) {
        this.model = model;
        this.bindingsList = [];
    }

    static parse(jsonData: any): CustomViewDataRecord {
        let data: CustomViewDataRecord = new CustomViewDataRecord(jsonData.model);
        for (let bindings of jsonData.bindingsList) {
            let bindingsMap: BindingMapping = {}
            for (let b in bindings) {
                let value: ARTNode = Deserializer.createRDFNode(bindings[b]);
                bindingsMap[b] = value;
            }
            data.bindingsList.push(bindingsMap);
        }
        return data;
    }
}

interface BindingMapping {
    [key: string]: ARTNode;
}

/**
 * Structures for data represented in ResView
 */
export interface PredicateCustomView { 
    predicate: ARTURIResource;
    data: CustomViewDataRecord[]
}




export abstract class AbstractView {
    abstract getIdResource(): ARTResource;
}

export class PointView extends AbstractView {
    location: ARTResource;
    latitude: ARTLiteral;
    longitude: ARTLiteral;

    getIdResource(): ARTResource {
        return this.location;
    }
}

export abstract class AbstractMultiPointView extends AbstractView {
    routeId: ARTResource;
    locations: {
        location: ARTResource;
        latitude: ARTLiteral;
        longitude: ARTLiteral;
    }[] = [];

    getIdResource(): ARTResource {
        return this.routeId;
    }
}

export class AreaView extends AbstractMultiPointView {}
export class RouteView extends AbstractMultiPointView {}

export class SeriesView extends AbstractView {
    series_id: ARTResource;
    series_label: string;
    value_label: string;
    data: {
        name: ARTResource;
        value: ARTLiteral;
    }[] = [];

    getIdResource(): ARTResource {
        return this.series_id;
    }
}

export class SeriesCollectionView extends AbstractView {
    series_collection_id: ARTResource;
    series_label: string;
    value_label: string;
    series: {
        series_name: ARTNode;
        data: {
            name: ARTResource;
            value: ARTLiteral;
        }[];
    }[] = [];

    getIdResource(): ARTResource {
        return this.series_collection_id;
    }
}
