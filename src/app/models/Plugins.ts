import { NTriplesUtil } from "../utils/ResourceUtils";
import { ARTLiteral, ARTNode } from "./ARTResources";

/**
 * Soon I will rename this class in STProperties (like server side) and Settings will extends STProperties
 */
export class Settings {
    public shortName: string;
    public type: string;
    public editRequired: boolean;
    public properties: STProperties[];
    public htmlDescription?: string;
    public htmlWarning?: string;
    constructor(shortName: string, type: string, editRequired: boolean, properties: STProperties[], htmlDescription?: string, htmlWaning?: string) {
        this.shortName = shortName;
        this.editRequired = editRequired;
        this.type = type;
        this.properties = properties;
        this.htmlDescription = htmlDescription;
        this.htmlWarning = htmlWaning;
    }

    public clone(): Settings {
        let properties: STProperties[] = [];
        for (let i = 0; i < this.properties.length; i++) {
            let p: STProperties = this.properties[i];
            properties.push(p.clone());
        }
        return new Settings(this.shortName, this.type, this.editRequired, properties, this.htmlDescription, this.htmlWarning);
    }

    /**
     * Tells if the setting needs to be configured
     */
    public requireConfiguration(): boolean {
        if (this.editRequired) { //setting needs to be edited and one of its props require config
            for (let p of this.properties) {
                if (p.requireConfiguration()) {
                    return true;
                }
            }
        } else {
            //if edit is not required, check if there is any properties which is an array is incomplete (with a nullish element)
            for (let p of this.properties) {
                if (p.value instanceof Array && p.value.some(v => SettingsProp.isNullish(v))) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Returns the property with the given name. Returns null if none property with that name exists
     * @param propName 
     */
    public getProperty(propName: string): STProperties {
        return this.properties.find(p => p.name == propName);
    }

    /**
     * Returns the value (if any) of the given property. Returns null if none property with that name exists.
     * @param propName 
     */
    public getPropertyValue(propName: string): any {
        let prop: STProperties = this.getProperty(propName);
        if (prop != null) {
            return prop.value;
        }
        return null;
    }

    public getPropertiesAsMap(includeType?: boolean): { [key: string]: string } {
        let map: { [key: string]: string } = {};
        if (includeType) {
            map["@type"] = this.type;
        }
        for (let i = 0; i < this.properties.length; i++) {
            let value = this.properties[i].value;

            if (value != null && typeof value === "string" && value == "") { //if user write then delete a value, the value is "", in this case "clear" the value
                value = undefined;
            } else if (value instanceof ARTNode) {
                value = value.toNT();
            } else if (value instanceof Array) {
                let serializedValues: any[] = [];
                for (let j = 0; j < value.length; j++) {
                    let v: any = value[j];
                    if (v instanceof ARTNode) {
                        serializedValues.push(v.toNT())
                    } else if(v instanceof Settings) {
                        serializedValues.push(v.getPropertiesAsMap());
                    } else {
                        serializedValues.push(v);
                    }
                }
                if (serializedValues.length) {
                    value = serializedValues;
                } else {
                    value = undefined;
                }
            } else if (value instanceof Settings) {
                value = value.getPropertiesAsMap();
            } else if (typeof value == "object") { //object => probably a map (associative array object)
                //don't do nothing except for empty map (clear the value)
                if (Object.keys(value).length === 0) {
                    value = undefined;
                }
            }
            map[this.properties[i].name] = value;
        }
        return map;
    }

    public static parse(response: any): Settings {
        let shortName: string = response.shortName;
        let type: string = response['@type'];
        let editRequired: boolean = response.editRequired;
        let htmlDescription: string = response.htmlDescription;
        let htmlWarning: string = response.htmlWarning;
        let props: STProperties[] = [];
        for (let p of response.properties) {
            props.push(STProperties.parse(p, type.includes("STPropertiesSchema")));
        }
        let stProps = new Settings(shortName, type, editRequired, props, htmlDescription, htmlWarning);
        return stProps;
    }
}

export class Enumeration {
    values: string[];
    open: boolean;
};

export class STProperties {
    public name: string;
    public displayName: any;
    public description: any;
    public required: boolean;
    public type: SettingsPropType;
    public value: any;
    public enumeration: Enumeration;
    constructor (name: string, displayName: any, description: any, required: boolean, type: SettingsPropType, enumeration?: Enumeration, value?: string) {
        this.name = name;
        this.displayName = displayName;
        this.description = description;
        this.required = required;
        this.value = value;
        this.enumeration = enumeration;
        this.type = type;
    }

    public requireConfiguration(): boolean {
        if (this.required) {
            return SettingsProp.isNullish(this.value);
        } else {
            return (this.value instanceof Array && this.value.some(v => SettingsProp.isNullish(v))) ||
                (this.value instanceof Settings && SettingsProp.isNullish(this.value));

        }
    }

    protected static cloneValue(value: any): any {
        if (value === null || typeof value != "object" || value instanceof String) { // "primitive" values that don't need to be cloned
            return value;
        } else if (value instanceof Array) {
            return value.map(v => STProperties.cloneValue(v));
        } else {
            let propValues = {};
            for (let prop of Object.getOwnPropertyNames(value)) {
                propValues[prop] = Object.getOwnPropertyDescriptor(value, prop);
                propValues[prop].value = STProperties.cloneValue(propValues[prop].value);
            }
            return Object.create(Object.getPrototypeOf(value), propValues);
        }
    }

    public static isNullish(v: any): boolean {
        return v == null ||
            (typeof v == "string" && v.trim() == "") ||
            (v instanceof Settings && v.requireConfiguration()) ||
            (v instanceof Array && (v.length == 0 ||
                v.findIndex(SettingsProp.isNullish) != -1
            ))
    }

    public clone(): STProperties {
        let clonedValue = STProperties.cloneValue(this.value);
        return new STProperties(this.name, this.displayName, this.description, this.required, this.type.clone(), this.enumeration, clonedValue);
    }

    public static parse(stProp: any, schema?: boolean): STProperties {
        let name = stProp.name;
        let required = stProp.required;
        let enumeration = stProp.enumeration;
        let type = SettingsPropType.parse(stProp.type);
        let value: any = stProp.value;
        if (stProp.value != null && schema) { //if the property belong to a schema, its value is a list of properties
            let props: STProperties[] = [];
            for (let v of stProp.value) {
                props.push(STProperties.parse(v))
            }
            value = props;
        }
        let displayName = stProp.displayName;
        let description = stProp.description;
        if (displayName instanceof Array) { //properties are DynamicSettingProp
            let displayNames: ARTLiteral[] = displayName.map(dn => NTriplesUtil.parseLiteral(dn));
            let descriptions: ARTLiteral[] = description.map(dn => NTriplesUtil.parseLiteral(dn));
            return new DynamicSettingProp(name, displayNames, descriptions, required, type, enumeration, value);
        } else {
            return new SettingsProp(name, displayName, description, required, type, enumeration, value)
        }
    }
}

export class SettingsProp extends STProperties {
    public displayName: string;
    public description: string;
}

export class DynamicSettingProp extends STProperties {
    public displayName: ARTLiteral[];
    public description: ARTLiteral[];

    /**
     * Return the display name in the given language.
     * If no display name is provided for the given languge, returns the first one
     * @param lang 
     */
    getDisplayName(lang: string): string {
        let dn: string;
        if (this.displayName.length > 0) {
            let dnLit = this.displayName.find(d => d.getLang() == lang);
            if (dnLit == null) {
                dnLit = this.displayName[0];
            }
            dn = dnLit.getValue();
        }
        return dn;
    }
    /**
     * Return the description in the given language.
     * If no description is provided for the given languge, returns the first one
     * @param lang 
     */
    getDescription(lang: string) {
        let d: string;
        if (this.description.length != 1) {
            let dnLit = this.description.find(d => d.getLang() == lang);
            if (dnLit == null) {
                dnLit = this.description[0];
            }
            d = dnLit.getValue();
        }
        return d;
    }

}

export class SettingsPropType {
    public name: string;
    public constraints: SettingsPropTypeConstraint[];
    public typeArguments: SettingsPropType[];
    public schema?: Settings;

    constructor(name: string, constraints?: SettingsPropTypeConstraint[], typeArguments?: SettingsPropType[], schema?: Settings) {
        this.name = name;
        this.constraints = constraints;
        this.typeArguments = typeArguments;
        this.schema = schema;
    }

    public static parse(jsonObject: any): SettingsPropType {
        let name = jsonObject.name;

        let constraints: SettingsPropTypeConstraint[];
        let constraintsJson = jsonObject.constraints;
        if (constraintsJson) {
            constraints = [];
            for (let i = 0; i < constraintsJson.length; i++) {
                constraints.push({ type: constraintsJson[i]["@type"], value: constraintsJson[i].value });
            }
        }

        let typeArguments: SettingsPropType[];
        let typeArgumentsJson = jsonObject.typeArguments;
        if (typeArgumentsJson) {
            typeArguments = [];
            for (let i = 0; i < typeArgumentsJson.length; i++) {
                typeArguments.push(SettingsPropType.parse(typeArgumentsJson[i]));
            }
        }

        let schema: Settings = null;
        if (jsonObject.schema) {
            schema = Settings.parse(jsonObject.schema);
        }

        return new SettingsPropType(name, constraints, typeArguments, schema);
    }

    public clone(): SettingsPropType {
        let constraints: SettingsPropTypeConstraint[];
        if (this.constraints) {
            constraints = [];
            for (let i = 0; i < this.constraints.length; i++) {
                constraints.push({ type: this.constraints[i].type, value: this.constraints[i].value });
            }
        }
        let typeArguments: SettingsPropType[];
        if (this.typeArguments) {
            typeArguments = [];
            for (let i = 0; i < this.typeArguments.length; i++) {
                typeArguments.push(this.typeArguments[i].clone());
            }
        }
        return new SettingsPropType(this.name, constraints, typeArguments, this.schema ? this.schema.clone() : null);
    }
}

export class SettingsPropTypeConstraint {
    type: string;
    value: string;
    //other attributes currently not taken into account
}

export class PluginSpecification {
    factoryId: string;
    configType?: string;
    configuration?: any;
    properties?: any; //object {"key1": "value", "key2": "value2", ...} //for old plugins. When they will be dropped, delete this
}


//Extension Point

export class ExtensionPointID {

    public static ST_CORE_ID: string = "it.uniroma2.art.semanticturkey.settings.core.SemanticTurkeyCoreSettingsManager";

    public static COLLABORATION_BACKEND_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.collaboration.CollaborationBackend";
    public static DATASET_CATALOG_CONNECTOR_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.datasetcatalog.DatasetCatalogConnector";
    public static DATASET_METADATA_EXPORTER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.datasetmetadata.DatasetMetadataExporter";
    // public static DEPLOYER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.deployer.Deployer"; //use repository/stream sourced deployer
    // public static LOADER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.loader.Loader"; //use repository/stream targeting loader
    public static RDF_LIFTER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.rdflifter.RDFLifter";
    public static RDF_TRANSFORMERS_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.rdftransformer.RDFTransformer";
    public static REFORMATTING_EXPORTER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.reformattingexporter.ReformattingExporter";
    public static RENDERING_ENGINE_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.rendering.RenderingEngine";
    public static REPO_IMPL_CONFIGURER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.repositoryimplconfigurer.RepositoryImplConfigurer";
    public static REPOSITORY_SOURCED_DEPLOYER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.deployer.RepositorySourcedDeployer";
    public static REPOSITORY_TARGETING_LOADER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.loader.RepositoryTargetingLoader";
    public static SEARCH_STRATEGY_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.search.SearchStrategy";
    public static STREAM_SOURCED_DEPLOYER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.deployer.StreamSourcedDeployer";
    public static STREAM_TARGETING_LOADER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.loader.StreamTargetingLoader";
    public static URI_GENERATOR_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.urigen.URIGenerator";
}

export abstract class ExtensionFactory {
    id: string;
    name: string;
    description: string;
    extensionType: string;
    constructor(id: string, name: string, description: string, extensionType: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.extensionType = extensionType;
    }

    public abstract clone(): ExtensionFactory;
}

export class ConfigurableExtensionFactory extends ExtensionFactory {
    scope: Scope;
    configurationScopes: Scope[];
    configurations: Settings[];
    constructor(id: string, name: string, description: string, extensionType: string, scope: Scope, configurationScopes: Scope[], configurations: Settings[]) {
        super(id, name, description, extensionType)
        this.scope = scope;
        this.configurationScopes = configurationScopes;
        this.configurations = configurations;
    }

    public clone(): ConfigurableExtensionFactory {
        let confs: Settings[] = [];
        this.configurations.forEach((conf: Settings) => {
            confs.push(conf.clone());
        });
        return new ConfigurableExtensionFactory(this.id, this.name, this.description, this.extensionType, this.scope, 
            this.configurationScopes, confs);
    }
}

export class NonConfigurableExtensionFactory extends ExtensionFactory {
    settingsScopes: Scope[];
    constructor(id: string, name: string, description: string, extensionType: string, settingsScopes: Scope[]) {
        super(id, name, description, extensionType)
        this.settingsScopes = settingsScopes;
    }

    public clone(): NonConfigurableExtensionFactory {
        return new NonConfigurableExtensionFactory(this.id, this.name, this.description, this.extensionType, this.settingsScopes);
    }
}

export class ExtensionPoint {
    id: string;
    interface?: string;
    interfaces?: string[];
    scope: Scope;
    settingsScopes?: Scope[];
    configurationScopes?: Scope[];

    getShortId(): string {
        return this.id.substring(this.id.lastIndexOf(".")+1);
    }

    static parse(json: any): ExtensionPoint {
        let ep: ExtensionPoint = new ExtensionPoint();
        ep.id = json.id;
        ep.interface = json.interface;
        ep.interfaces = json.interfaces;
        ep.scope = json.scope;
        ep.settingsScopes = json.settingsScopes;
        ep.configurationScopes = json.configurationScopes;
        return ep;
    }
}

export enum Scope {
    SYSTEM = "SYSTEM",
    PROJECT = "PROJECT",
    USER = "USER",
    PROJECT_USER = "PROJECT_USER",
    PROJECT_GROUP = "PROJECT_GROUP",
    FACTORY = "FACTORY"
}

export class ScopeUtils {
    public static serializeScope(scope: Scope): string {
        if (scope == Scope.SYSTEM) {
            return "sys";
        } else if (scope == Scope.PROJECT) {
            return "proj";
        } else if (scope == Scope.USER) { 
            return "usr";
        } else if (scope == Scope.PROJECT_USER) {
            return "pu";
        } else if (scope == Scope.PROJECT_GROUP) {
            return "pg";
        }
    }

    public static deserializeScope(serialization: string): Scope {
        if (serialization == "sys") {
            return Scope.SYSTEM;
        } else if (serialization == "proj") {
            return Scope.PROJECT;
        } else if (serialization == "usr") {
            return Scope.USER;
        } else if (serialization == "pu") {
            return Scope.PROJECT_USER
        }  else if (serialization == "factory") {
            return Scope.FACTORY
        }
    }
}


export class TransformationStep {
    filter: {
        factoryId: string,
        configuration: {[key: string]: any}
    };
    graphs?: string[]
}

export enum ExtensionConfigurationStatus {
    saved = "saved", //configuration just loaded or saved
    unsaved = "unsaved" //configuration modified or unsaved
}