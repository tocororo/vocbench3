import { BindingName } from "typescript";
import { Deserializer } from "../utils/Deserializer";
import { ARTNode, ARTResource, ARTURIResource } from "./ARTResources";
import { Configuration, Reference } from "./Configuration";
import { Scope } from "./Plugins";

export class Widget extends Configuration {}

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

    getBindingsNames(): WidgetDataBinding[] {
        return <WidgetDataBinding[]>Object.keys(this.bindingsList[0]);
    }

    /**
     * Returns the binding used as identifier of the grouped data
     * @returns
     */
    getIdBinding(): WidgetDataBinding {
        if (this.type == WidgetDataType.area || this.type == WidgetDataType.route) {
            return WidgetDataBinding.route_id;
        } else if (this.type == WidgetDataType.point) {
            return WidgetDataBinding.location;
        } else if (this.type == WidgetDataType.series) {
            return WidgetDataBinding.series_id;
        } else if (this.type == WidgetDataType.series_collection) {
            return WidgetDataBinding.series_collection_id;
        }
    }

    /**
     * Returns the value used as identifier of the data
     * @returns 
     */
    getIdValue(): ARTResource {
        let idBinding = this.getIdBinding();
        //identifier should be the same for each bindings set, so it is ok to get just the first
        //moreover, by construction, the id value must be a resource, so it is ok to cast it
        return <ARTResource>this.bindingsList[0][idBinding];
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
    series_label = "series_label",
    series_name = "series_name",
    name = "name",
    value_label = "value_label",
    value = "value",
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

    private static map: { [type: string]: WidgetDataBinding[] } = {
        [WidgetDataType.point]: [WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.area]: [WidgetDataBinding.route_id, WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.route]: [WidgetDataBinding.route_id, WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.series]: [WidgetDataBinding.series_id, WidgetDataBinding.series_label, WidgetDataBinding.value_label, WidgetDataBinding.name, WidgetDataBinding.value],
        [WidgetDataType.series_collection]: [WidgetDataBinding.series_collection_id, WidgetDataBinding.series_label, WidgetDataBinding.value_label, WidgetDataBinding.series_name, WidgetDataBinding.name, WidgetDataBinding.value],
    };

    /**
     * Given a type of data, returns the list of binding required in the retrieve query
     * (e.g. point require location, latitude and longitude)
     * @param dataType 
     * @returns 
     */
    static getRequiredBindings(dataType: WidgetDataType): WidgetDataBinding[] {
        return this.map[dataType].slice(); //in order to not let alterate directly the map from the returned list
    }

    /**
     * Given a list of bindings, returns the list of datatype that foreseen such bindings
     * (e.g. route_id, location, latitude, longitude are foreseen in area and route)
     * @param bindings 
     */
    static getCompliantDataTypes(bindings: WidgetDataBinding[]): WidgetDataType[] {
        let compliant: WidgetDataType[] = [];
        for (let dataType in this.map) {
            let typeBindings = this.getRequiredBindings(<WidgetDataType>dataType); 
            bindings.sort();
            typeBindings.sort();
            if (bindings.length == typeBindings.length && JSON.stringify(bindings) == JSON.stringify(typeBindings)) {
                compliant.push(<WidgetDataType>dataType);
            } 
        }
        return compliant;
    }

}

export class WidgetDataTypeCompliantMap {

    private static map: { [type: string]: WidgetDataType[] } = {
        [WidgetEnum.map]: [WidgetDataType.area, WidgetDataType.point, WidgetDataType.route],
        [WidgetEnum.bar]: [WidgetDataType.series, WidgetDataType.series_collection],
        [WidgetEnum.pie]: [WidgetDataType.series],
    }

    /**
     * given the type of widget (map, pie-chart, bar-chart) returns the representable type of data
     * (e.g. map can represents area, point, route)
     * @param widgetType 
     * @returns 
     */
    static getCompliantDataType(widgetType: WidgetEnum): WidgetDataType[] {
        return this.map[widgetType];
    }

    /**
     * Given a type of data, returns the widgets able to represent it (e.g. series can be represented by pie-chart and bar-chart)
     * @param dataType 
     * @returns 
     */
    static getCompliantWidgets(dataType: WidgetDataType): WidgetEnum[] {
        let widgets: WidgetEnum[] = [];
        for (let w in this.map) {
            if (this.map[w].includes(dataType)) {
                widgets.push(<WidgetEnum>w);
            }
        }
        return widgets;
    }

};