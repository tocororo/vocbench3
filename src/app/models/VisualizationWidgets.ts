import { Deserializer } from "../utils/Deserializer";
import { ARTNode, ARTURIResource } from "./ARTResources";
import { Configuration, Reference } from "./Configuration";
import { Scope } from "./Plugins";

export class Widget extends Configuration {}

export interface WidgetDefinition {
    type: WidgetDataType,
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
    
    private map: {[key: string]: ARTNode}; //map binding -> value

    constructor() {
        this.map = {};
    }

    getBindings(): WidgetDataBinding[] {
        return <WidgetDataBinding[]>Object.keys(this.map);
    }

    getValue(binding: WidgetDataBinding) {
        return this.map[binding];
    }

    setValue(binding: WidgetDataBinding, value: ARTNode) {
        this.map[binding] = value;
    }

    static parse(jsonData: any): WidgetDataRecord {
        let data: WidgetDataRecord = new WidgetDataRecord();
        for (let binding in jsonData) {
            let value: ARTNode = Deserializer.createRDFNode(jsonData[binding]);
            data.setValue(<WidgetDataBinding>binding, value);
        }
        return data;
    }
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
    polyline_id = "polyline_id",
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

}

/**
 * Mapping between the type of data and the required bindings
 */
export class DataTypeBindingsMap {

    private static map: { [type: string]: WidgetDataBinding[] } = {
        [WidgetDataType.point]: [WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.area]: [WidgetDataBinding.polyline_id, WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.route]: [WidgetDataBinding.polyline_id, WidgetDataBinding.location, WidgetDataBinding.latitude, WidgetDataBinding.longitude],
        [WidgetDataType.series]: [WidgetDataBinding.series_id, WidgetDataBinding.series_label, WidgetDataBinding.value_label, WidgetDataBinding.name, WidgetDataBinding.value],
        [WidgetDataType.series_collection]: [WidgetDataBinding.series_collection_id, WidgetDataBinding.series_label, WidgetDataBinding.value_label, WidgetDataBinding.series_name, WidgetDataBinding.name, WidgetDataBinding.value],
    };

    /**
     * Given a type of data, returns the list of binding required in the retrieve query
     * @param dataType 
     * @returns 
     */
    static getRequiredBindings(dataType: WidgetDataType): WidgetDataBinding[] {
        return this.map[dataType].slice(); //in order to not let alterate directly the map from the returned list
    }

    /**
     * Given a list of bindings, returns the list of datatype compliants with such bindings
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

    static getCompliantDataType(widgetType: WidgetEnum): WidgetDataType[] {
        return this.map[widgetType];
    }

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