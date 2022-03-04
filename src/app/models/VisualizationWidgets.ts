import { Deserializer } from "../utils/Deserializer";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource } from "./ARTResources";
import { Configuration, Reference } from "./Configuration";
import { Scope } from "./Plugins";

export class WidgetConfiguration extends Configuration {}

export interface WidgetDefinition {
    retrieve: string;
    update: string;
}

export interface WidgetStruct {
    reference: string; //complete relative reference
    scope: Scope; //project for project-local, system for system-wide shared, factory for factory-provided
    name: string; //the identifier from the reference
}

export class WidgetAssociation {
    ref: string; 
    trigger: ARTURIResource;
    widget: WidgetStruct;
}

/**
 * Interface of the data returned by server
 */
export class WidgetDataRecord {
    
    type: WidgetDataType;
    bindingsList: BindingMapping[]; //list of mappings binding -> value

    constructor(type: WidgetDataType) {
        this.type = type;
        this.bindingsList = [];
    }

    static parse(jsonData: any): WidgetDataRecord {
        let data: WidgetDataRecord = new WidgetDataRecord(jsonData.widgetDataType);
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

export interface BindingMapping {
    [key: string]: ARTNode
}


/**
 * List of available widgets
 */
 export enum WidgetEnum {
    map = "map",
    pie = "pie",
    bar = "bar",
    line = "line"
}

/**
 * List of widget categories
 */
export enum WidgetCategory {
    map = "map",
    chart = "chart"
}

/**
 * List of representable widget type of data
 */
export enum WidgetDataType {
    area = "area",
    point = "point",
    route = "route",
    series = "series",
    series_collection = "series_collection"
}

export enum WidgetDataBinding {
    //for maps data
    route_id = "route_id",
    location = "location", 
    latitude = "latitude", 
    longitude = "longitude",
    //for charts data
    series_collection_id = "series_collection_id",
    series_id = "series_id",
    series_name = "series_name",
    name = "name",
    value = "value",
    series_label = "series_label",
    value_label = "value_label",
}

export class WidgetUtils {

    static convertReferenceToWidgetStruct(reference: string): WidgetStruct {
        return {
            reference: reference,
            scope: Reference.getRelativeReferenceScope(reference),
            name: Reference.getRelativeReferenceIdentifier(reference)
        }
    }

    static classNameDataTypeMap: { [className: string]: WidgetDataType } = {
        "it.uniroma2.art.semanticturkey.config.visualizationwidgets.AreaWidget": WidgetDataType.area,
        "it.uniroma2.art.semanticturkey.config.visualizationwidgets.PointWidget": WidgetDataType.point,
        "it.uniroma2.art.semanticturkey.config.visualizationwidgets.RouteWidget": WidgetDataType.route,
        "it.uniroma2.art.semanticturkey.config.visualizationwidgets.SeriesWidget": WidgetDataType.series,
        "it.uniroma2.art.semanticturkey.config.visualizationwidgets.SeriesCollectionWidget": WidgetDataType.series_collection,
    }

}

/**
 * Mapping between the type of data and the required bindings
 */
export class DataTypeBindingsMap {

    private static variableRequirementsMap: { [type: string]: { variable: WidgetDataBinding, retrieveRequired: boolean, updateRequired: boolean }[] } = {
        [WidgetDataType.point]: [
            { variable: WidgetDataBinding.location, retrieveRequired: true, updateRequired: true }, 
            { variable: WidgetDataBinding.latitude, retrieveRequired: true, updateRequired: true }, 
            { variable: WidgetDataBinding.longitude, retrieveRequired: true, updateRequired: true }, 
        ],
        [WidgetDataType.area]: [
            { variable: WidgetDataBinding.route_id, retrieveRequired: true, updateRequired: false }, 
            { variable: WidgetDataBinding.location, retrieveRequired: true, updateRequired: true }, 
            { variable: WidgetDataBinding.latitude, retrieveRequired: true, updateRequired: true }, 
            { variable: WidgetDataBinding.longitude, retrieveRequired: true, updateRequired: true }, 
        ],
        [WidgetDataType.route]: [
            { variable: WidgetDataBinding.route_id, retrieveRequired: true, updateRequired: false }, 
            { variable: WidgetDataBinding.location, retrieveRequired: true, updateRequired: true }, 
            { variable: WidgetDataBinding.latitude, retrieveRequired: true, updateRequired: true }, 
            { variable: WidgetDataBinding.longitude, retrieveRequired: true, updateRequired: true }, 
        ],
        [WidgetDataType.series]: [
            { variable: WidgetDataBinding.series_id, retrieveRequired: true, updateRequired: false }, 
            { variable: WidgetDataBinding.series_label, retrieveRequired: false, updateRequired: false }, 
            { variable: WidgetDataBinding.value_label, retrieveRequired: false, updateRequired: false }, 
            { variable: WidgetDataBinding.name, retrieveRequired: true, updateRequired: false }, 
            { variable: WidgetDataBinding.value, retrieveRequired: true, updateRequired: true }, 
        ],
        [WidgetDataType.series_collection]: [
            { variable: WidgetDataBinding.series_collection_id, retrieveRequired: true, updateRequired: false }, 
            { variable: WidgetDataBinding.series_label, retrieveRequired: false, updateRequired: false }, 
            { variable: WidgetDataBinding.value_label, retrieveRequired: false, updateRequired: false }, 
            { variable: WidgetDataBinding.series_name, retrieveRequired: true, updateRequired: false }, 
            { variable: WidgetDataBinding.name, retrieveRequired: true, updateRequired: false }, 
            { variable: WidgetDataBinding.value, retrieveRequired: true, updateRequired: true }, 
        ]
    };

    /**
     * Given a type of data, returns the list of binding required in the retrieve query
     * (e.g. point require location, latitude and longitude)
     * @param dataType 
     * @returns 
     */
    static getRequiredRetrieveBindings(dataType: WidgetDataType): WidgetDataBinding[] {
        return this.variableRequirementsMap[dataType].filter(el => el.retrieveRequired).map(el => el.variable);
    }
    static getRequiredUpdateBindings(dataType: WidgetDataType): WidgetDataBinding[] {
        return this.variableRequirementsMap[dataType].filter(el => el.updateRequired).map(el => el.variable);
    }

}


export abstract class Widget {

    abstract getIdResource(): ARTResource;
}

export class PointWidget extends Widget {
    location: ARTResource;
    latitude: ARTLiteral;
    longitude: ARTLiteral;

    getIdResource(): ARTResource {
        return this.location;
    }
}

export abstract class MultiPointWidget extends Widget {
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

export class AreaWidget extends MultiPointWidget {}
export class RouteWidget extends MultiPointWidget {}

export class SeriesWidget extends Widget {
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

export class SeriesCollectionWidget extends Widget {
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