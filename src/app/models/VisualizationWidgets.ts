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
    x_axis_label = "x_axis_label",
    y_axis_label = "y_axis_label",
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

    private static retrieve: { [type: string]: WidgetDataBinding[] } = {
        [WidgetDataType.point]: [WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.area]: [WidgetDataBinding.route_id, WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.route]: [WidgetDataBinding.route_id, WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.series]: [WidgetDataBinding.series_id, WidgetDataBinding.x_axis_label, WidgetDataBinding.y_axis_label, WidgetDataBinding.name, WidgetDataBinding.value],
        [WidgetDataType.series_collection]: [WidgetDataBinding.series_collection_id, WidgetDataBinding.x_axis_label, WidgetDataBinding.y_axis_label, WidgetDataBinding.series_name, WidgetDataBinding.name, WidgetDataBinding.value],
    };
    private static update: { [type: string]: WidgetDataBinding[] } = {
        [WidgetDataType.point]: [WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.area]: [WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.route]: [WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.series]: [WidgetDataBinding.name, WidgetDataBinding.value],
        [WidgetDataType.series_collection]: [WidgetDataBinding.name, WidgetDataBinding.value],
    };

    /**
     * Given a type of data, returns the list of binding required in the retrieve query
     * (e.g. point require location, latitude and longitude)
     * @param dataType 
     * @returns 
     */
    static getRequiredRetrieveBindings(dataType: WidgetDataType): WidgetDataBinding[] {
        return this.retrieve[dataType].slice(); //in order to not let alterate directly the map from the returned list
    }
    static getRequiredUpdateBindings(dataType: WidgetDataType): WidgetDataBinding[] {
        return this.update[dataType].slice(); //in order to not let alterate directly the map from the returned list
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
    x_axis_label: string;
    y_axis_label: string;
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
    x_axis_label: string;
    y_axis_label: string;
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