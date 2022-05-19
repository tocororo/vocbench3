import { NTriplesUtil } from "../utils/ResourceUtils";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource, RDFTypesEnum } from "./ARTResources";
import { Configuration, Reference } from "./Configuration";
import { Scope } from "./Plugins";
import { QueryMode } from "./Sparql";


// ============= VIEWS =============

export class CustomViewConfiguration extends Configuration { }

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

export interface PointViewDefinition extends SparqlBasedCustomViewDefinition { }
export interface AreaViewDefinition extends SparqlBasedCustomViewDefinition { }
export interface RouteViewDefinition extends SparqlBasedCustomViewDefinition { }
export interface SeriesViewDefinition extends SparqlBasedCustomViewDefinition { }
export interface SeriesCollectionViewDefinition extends SparqlBasedCustomViewDefinition { }

export interface PropertyChainViewDefinition extends PropertiesBasedViewDefinition { }

export interface AdvSingleValueViewDefinition extends CustomViewDefinition {
    retrieve: string;
    update: UpdateInfo;
}

export interface StaticVectorViewDefinition extends PropertiesBasedViewDefinition { }

export interface DynamicVectorViewDefinition extends CustomViewDefinition {
    retrieve: string;
    update: UpdateInfo[];
}

export interface UpdateInfo {
    field: string;
    updateMode: UpdateMode; //tells if and how the new value can be edited/chosen (through a resource picker or with edit inline)
    updateQuery?: string;
    valueType?: RDFTypesEnum.resource | RDFTypesEnum.literal;
    datatype?: string; //NT IRI representation
    classes?: string[]; //NT IRI representation
}

export enum UpdateMode {
    none = "none",
    picker = "picker",
    inline = "inline"
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
        };
    }
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

// ==== stuff for editor

export enum CustomViewDefinitionKeys {
    properties = "properties",
    retrieve = "retrieve",
    suggestedView = "suggestedView",
    update = "update",
}

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
    };

    /**
     * Mapping between the model of CV and the available view types
     */
    static readonly modelToViewMap: { [model: string]: { id: ViewsEnum, translationKey: string }[] } = {
        [CustomViewModel.adv_single_value]: [{ id: ViewsEnum.single_value, translationKey: "CUSTOM_VIEWS.MODELS.SINGLE_VALUE.SINGLE_VALUE" }],
        [CustomViewModel.property_chain]: [{ id: ViewsEnum.single_value, translationKey: "CUSTOM_VIEWS.MODELS.SINGLE_VALUE.SINGLE_VALUE" }],
        [CustomViewModel.static_vector]: [{ id: ViewsEnum.table, translationKey: "CUSTOM_VIEWS.MODELS.VECTOR.TABLE" }],
        [CustomViewModel.dynamic_vector]: [{ id: ViewsEnum.table, translationKey: "CUSTOM_VIEWS.MODELS.VECTOR.TABLE" }],
        [CustomViewModel.point]: [{ id: ViewsEnum.map, translationKey: "CUSTOM_VIEWS.MODELS.GEOSPATIAL.MAP" }],
        [CustomViewModel.area]: [{ id: ViewsEnum.map, translationKey: "CUSTOM_VIEWS.MODELS.GEOSPATIAL.MAP" }],
        [CustomViewModel.route]: [{ id: ViewsEnum.map, translationKey: "CUSTOM_VIEWS.MODELS.GEOSPATIAL.MAP" }],
        [CustomViewModel.series]: [
            { id: ViewsEnum.bar, translationKey: "CUSTOM_VIEWS.MODELS.STATISTICAL_SERIES.BAR_CHART" },
            { id: ViewsEnum.pie, translationKey: "CUSTOM_VIEWS.MODELS.STATISTICAL_SERIES.PIE_CHART" }
        ],
        [CustomViewModel.series_collection]: [{ id: ViewsEnum.line, translationKey: "CUSTOM_VIEWS.MODELS.STATISTICAL_SERIES.LINE_CHART" }]
    };

}

export enum CustomViewVariables {
    latitude = "latitude", //in area, route, point
    location = "location", //in area, route, point
    longitude = "longitude", //in area, route, point
    name = "name", //in series, series_collection
    route_id = "route_id", //in area, route
    series_id = "series_id", //in series
    series_label = "series_label", //in series, series_collection
    series_collection_id = "series_collection_id", //in series_collection
    series_name = "series_name", //in series_collection
    show = "show", //in adv_single_value
    value = "value", //in series, series_collection, adv_single_value
    value_label = "value_label", //in series, series_collection
    //reserved one
    resource = "resource",
    trigprop = "trigprop",
}

export interface CvSparqlEditorStruct {
    query: string;
    mode: QueryMode;
    valid: boolean;
}

export class CvQueryUtils {

    private static readonly VAR_REGEX: RegExp = /\?([a-zA-Z0-9_]+)_value\b/gi;
    private static readonly OBJ_REGEX: RegExp = /\$resource\s*\$trigprop\s*([$|?][a-zA-Z0-9_]+)\s*\./gi;
    private static readonly FIELD_REGEX: RegExp = /[?|$]([a-zA-Z0-9_]+)_value\b/gi;

    static getSelectReturnStatement(query: string): string {
        return query.substring(query.toLocaleLowerCase().indexOf("select"), query.toLocaleLowerCase().indexOf("{"));
    }

    static getSelectWhereBlock(query: string): string {
        return query.substring(query.toLocaleLowerCase().indexOf("where"));
    }

    /**
     * Returns true if varName is returned by query. This method take in account cases where
     * select returns all variables (*) or specific ones
     * @param query 
     * @param varName name of the variable (handle var starting with ?, $ and neither of them)
     * @returns 
     */
    static isVariableReturned(query: string, varName: string): boolean {
        let queryFragment: string;
        let select = this.getSelectReturnStatement(query);
        if (select.includes("*")) {
            queryFragment = this.getSelectWhereBlock(query);
        } else {
            queryFragment = select;
        }
        let varPattern = this.getNormalizedVarPattern(varName);
        let regexp: RegExp = new RegExp(varPattern + "\\b", "gi");
        return regexp.test(queryFragment);
    }

    /**
     * Returns true if the placeholderName is used in the query where block
     * @param query 
     * @param placeholderName name of the placeholder, excluding the leading $
     */
    static isPlaceholderInWhere(query: string, placeholderName: string): boolean {
        let where = this.getSelectWhereBlock(query);
        let placeholderRegexp: RegExp = new RegExp("\\$" + placeholderName + "\\b", "gi");
        return placeholderRegexp.test(where);
    }

    /**
     * Returns true if the placeholderName is used in the query where block
     * @param query 
     * @param varName name of the placeholder, excluding the leading $
     */
    static isVariableUsed(query: string, varName: string): boolean {
        let varPattern = this.getNormalizedVarPattern(varName);
        let varRegexp: RegExp = new RegExp(varPattern + "\\b", "gi");
        return varRegexp.test(query);
    }

    /**
     * Returns the list of fields name detected from returned ?field_value variables
     * @param query 
     * @returns 
     */
    static listFieldVariables(query: string): string[] {
        let fieldVars: string[] = [];

        let queryFragment: string;
        let select = CvQueryUtils.getSelectReturnStatement(query);
        if (select.includes("*")) {
            queryFragment = CvQueryUtils.getSelectWhereBlock(query);
        } else {
            queryFragment = select;
        }

        let matchArray: RegExpExecArray;
        CvQueryUtils.FIELD_REGEX.lastIndex = 0;
        while ((matchArray = CvQueryUtils.FIELD_REGEX.exec(queryFragment)) !== null) {
            fieldVars.push(matchArray[1]); //0 is the whole expression, 1 is the 1st group (any word between ? and _value)
        }
        fieldVars = fieldVars.filter((s, idx, list) => list.indexOf(s) == idx); //remove eventual duplicates
        return fieldVars;
    }

    /**
     * Returns the object variable in the triple $resource $trigprop ?obj. The object must be returned by select query
     * If such variable is not detected, or it is not returned by the select, returns null.
     * @param query 
     * @returns 
     */
    static getReturnedObjectVariable(query: string): string {
        let objVar: string;
        let select = CvQueryUtils.getSelectReturnStatement(query);
        let where = CvQueryUtils.getSelectWhereBlock(query);
        CvQueryUtils.OBJ_REGEX.lastIndex = 0;
        let matchArray: RegExpExecArray = CvQueryUtils.OBJ_REGEX.exec(where);
        if (matchArray != null) {
            objVar = matchArray[1]; //group 1 is ?|$objVarName (including ? or $)
        }
        if (objVar != null && (select.includes("*") || this.isVariableReturned(query, objVar))) {
            return objVar;
        } else {
            return null;
        }
    }

    /**
     * Given a varName, returns the normalized pattern for detecting the variable with
     * - a leading $ or ? in case varName doesn't start with any of them
     * - escaping $ or ? in case varName starts with one of them
     * @param varName 
     * @returns 
     */
    private static getNormalizedVarPattern(varName: string) {
        let varPattern: string = varName;
        if (varPattern.startsWith("?") || varPattern.startsWith("$")) {
            varPattern = "\\" + varPattern; //start with ? or $ => escape it in patter
        } else if (!varPattern.startsWith("$")) {
            varPattern = "[?|$]" + varPattern; //not starting with ? nor $ => add them in or in the pattern 
        }
        return varPattern;
    }

}

// ============= DATA =============

/**
 * Structures for data represented in ResView
 */
export interface PredicateCustomView {
    predicate: ARTURIResource;
    cvData: CustomViewData;
}

/**
 * classes representing the different types of CV
 */

export abstract class AbstractView {
    abstract category: CustomViewCategory;
    abstract model: CustomViewModel;

    resource: ARTNode; //resource/value described by the view
    defaultView: ViewsEnum;

    constructor(resource: ARTNode, defaultView: ViewsEnum) {
        this.resource = resource;
        this.defaultView = defaultView;
    }
}

export abstract class AbstractSparqlBasedView extends AbstractView {
    /**
     * tells if the view can be edited or not
     * it is useful in this kind of views since there is no UpdateInfo in the described value, like in single-value and vector views,
     * and the "updatable" of a value is determined just from the presence of the update query)
     */
    allowEdit: boolean;
}

export class PointView extends AbstractSparqlBasedView {
    category: CustomViewCategory = CustomViewCategory.geospatial;
    model: CustomViewModel = CustomViewModel.point;

    location: ARTResource;
    latitude: ARTLiteral;
    longitude: ARTLiteral;
}

export abstract class AbstractMultiPointView extends AbstractSparqlBasedView {
    category: CustomViewCategory = CustomViewCategory.geospatial;

    routeId: ARTResource;
    locations: {
        location: ARTResource;
        latitude: ARTLiteral;
        longitude: ARTLiteral;
    }[] = [];
}

export class AreaView extends AbstractMultiPointView {
    model: CustomViewModel = CustomViewModel.area;
}
export class RouteView extends AbstractMultiPointView {
    model: CustomViewModel = CustomViewModel.route;
}

export class SeriesView extends AbstractSparqlBasedView {
    category: CustomViewCategory = CustomViewCategory.statistical_series;
    model: CustomViewModel = CustomViewModel.series;

    series_id: ARTResource;
    series_label: string;
    value_label: string;
    data: {
        name: ARTResource;
        value: ARTLiteral;
    }[] = [];
}

export class SeriesCollectionView extends AbstractSparqlBasedView {
    category: CustomViewCategory = CustomViewCategory.statistical_series;
    model: CustomViewModel = CustomViewModel.series_collection;

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
}

export abstract class AbstractSingleValueView extends AbstractView {
    category: CustomViewCategory = CustomViewCategory.single_value;

    value: CustomViewRenderedValue;
}
export class PropertyChainView extends AbstractSingleValueView {
    model: CustomViewModel = CustomViewModel.property_chain;
}
export class AdvSingleValueView extends AbstractSingleValueView {
    model: CustomViewModel = CustomViewModel.adv_single_value;
}

export abstract class AbstractVectorView extends AbstractView {
    category: CustomViewCategory = CustomViewCategory.vector;

    values: CustomViewRenderedValue[];
}
export class StaticVectorView extends AbstractVectorView {
    model: CustomViewModel = CustomViewModel.static_vector;
}
export class DynamicVectorView extends AbstractVectorView {
    model: CustomViewModel = CustomViewModel.dynamic_vector;
}


/* ====== response data ====== */


export class CustomViewData {
    model: CustomViewModel;
    defaultView: ViewsEnum;
    data: CustomViewObjectDescription[]; //one for each object of the triggering property $resource $trigprop ?object

    static parse(json: any) {
        let d: CustomViewData = new CustomViewData();
        d.model = json.model;
        d.defaultView = json.defaultView;
        d.data = json.data.map((d: any) => CustomViewObjectDescription.parse(json.model, d));
        return d;
    }
}

export class CustomViewObjectDescription {
    resource: ARTNode;
    description: SparqlBasedValueDTO | //for sparql based views (charts and maps) 
        CustomViewRenderedValue[] | //for vector views (static/dynamic) one for each property/header of the vector
        CustomViewRenderedValue; //for single-value views

    static parse(model: CustomViewModel, json: any): CustomViewObjectDescription {
        let description: any;
        if (
            model == CustomViewModel.area || model == CustomViewModel.point || model == CustomViewModel.route ||
            model == CustomViewModel.series || model == CustomViewModel.series_collection
        ) {
            description = SparqlBasedValueDTO.parse(json.description);
        } else if (model == CustomViewModel.property_chain || model == CustomViewModel.adv_single_value) {
            description = CustomViewRenderedValue.parse(json.description);
        } else if (model == CustomViewModel.static_vector || model == CustomViewModel.dynamic_vector) {
            description = json.description.map((d: any) => CustomViewRenderedValue.parse(d));
        }
        let d: CustomViewObjectDescription = {
            resource: NTriplesUtil.parseNode(json.resource),
            description: description
        };
        return d;
    }
}

export class SparqlBasedValueDTO {
    bindingsList: BindingMapping[];
    updateMode: UpdateMode;

    constructor() {
        this.bindingsList = [];
    }

    static parse(json: any): SparqlBasedValueDTO {
        let dto: SparqlBasedValueDTO = new SparqlBasedValueDTO();
        dto.updateMode = json.updateMode;
        for (let bindings of json.bindingsList) {
            let bindingsMap: BindingMapping = {};
            for (let b in bindings) {
                let value: ARTNode = NTriplesUtil.parseNode(bindings[b]);
                bindingsMap[b] = value;
            }
            dto.bindingsList.push(bindingsMap);
        }
        return dto;
    }
}

export interface BindingMapping {
    [key: string]: ARTNode;
}

export class CustomViewRenderedValue {
    field: string; //for vector tells
    resource: ARTNode;
    pivots: BindingMapping;
    updateInfo: UpdateInfo; //tells how to update the value

    static parse(json: any): CustomViewRenderedValue {
        let v = new CustomViewRenderedValue();
        v.field = json.field;
        v.resource = json.resource ? NTriplesUtil.parseNode(json.resource) : null; //in case of table, a cell content, namely the value, can also be emtpy/null
        let pivots: BindingMapping = {};
        for (let pivotName in json.pivots) {
            let value: ARTNode = NTriplesUtil.parseNode(json.pivots[pivotName]);
            pivots[pivotName] = value;
        }
        v.pivots = pivots;
        v.updateInfo = json.updateInfo;
        return v;
    }
}

