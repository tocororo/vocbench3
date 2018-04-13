import { ARTURIResource } from "./ARTResources";

/**
 * in the future this could have also a description field
 */
export class Plugin {
    public factoryID: string;
    constructor(factoryID: string) {
        this.factoryID = factoryID;
    }
}

/**
 * Soon I will rename this class in STProperties (like server side) and Settings will extends STProperties
 */
export class Settings {
    public shortName: string;
    public type: string;
    public editRequired: boolean;
    public properties: SettingsProp[];
    public htmlDescription?: string;
    public htmlWarning?: string;
    constructor(shortName: string, type: string, editRequired: boolean, properties: SettingsProp[], htmlDescription?: string, htmlWaning?: string) {
        this.shortName = shortName;
        this.editRequired = editRequired;
        this.type = type;
        this.properties = properties;
        this.htmlDescription = htmlDescription;
        this.htmlWarning = htmlWaning;
    }

    public clone(): Settings {
        var properties: SettingsProp[] = [];
        for (var i = 0; i < this.properties.length; i++) {
            let p: SettingsProp = this.properties[i];
            properties.push(p.clone());
        }
        return new Settings(this.shortName, this.type, this.editRequired, properties);
    }

    public requireConfiguration(): boolean {
        if (this.editRequired) {
            for (var i = 0; i < this.properties.length; i++) {
                if (
                    this.properties[i].required && (
                        this.properties[i].value == null || 
                        (typeof this.properties[i].value == "string" && this.properties[i].value.trim() == "") ||
                        (this.properties[i].value instanceof Array && this.properties[i].value.length == 0)
                    )
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    public getPropertiesAsMap(): { [key: string]: string } {
        let map: { [key: string]: string } = {};
        for (var i = 0; i < this.properties.length; i++) {
            let value = this.properties[i].value;
            if (value != null && typeof value === "string" && value == "") { //if user write then delete a value, the value is "", in this case "clear" the value
                value = undefined;
            }
            if (value instanceof ARTURIResource) {
                value = value.toNT();
            }
            if (value instanceof Array) {
                let serializedValues: string[] = [];
                for (var j = 0; j < value.length; j++) {
                    let v: any = value[j];
                    if (v instanceof ARTURIResource) {
                        serializedValues.push(v.toNT())
                    } else {
                        serializedValues.push(v);
                    }
                }
                value = serializedValues;
            }
            map[this.properties[i].name] = value;
        }
        return map;
    }

    public static parse(response: any): Settings {
        let props: SettingsProp[] = [];
        for (var i = 0; i < response.properties.length; i++) {
            let name = response.properties[i].name;
            let displayName = response.properties[i].displayName;
            let description = response.properties[i].description;
            let required = response.properties[i].required;
            let value = response.properties[i].value;
            let enumeration = response.properties[i].enumeration;
            let type = SettingsPropType.parse(response.properties[i].type);
            props.push(new SettingsProp(name, displayName, description, required, type, enumeration, value));
        }
        let stProps = new Settings(response.shortName, response['@type'], response.editRequired, props, 
            response.htmlDescription, response.htmlWarning);
        return stProps;
    }
}

export class SettingsProp {
    public name: string;
    public displayName: string;
    public description: string;
    public required: boolean;
    public type: SettingsPropType;
    public value: any;
    public enumeration: string[];
    constructor (name: string, displayName: string, description: string, required: boolean, type: SettingsPropType, enumeration?: string[], value?: string) {
        this.name = name;
        this.displayName = displayName;
        this.description = description;
        this.required = required;
        this.value = value;
        this.enumeration = enumeration;
        this.type = type;
    }

    public clone(): SettingsProp {
        return new SettingsProp(this.name, this.displayName, this.description, this.required, this.type.clone(), this.enumeration, this.value);
    }
}

export class SettingsPropType {
    public name: string;
    public constraints: SettingsPropTypeConstraint[];
    public typeArguments: SettingsPropType[];

    constructor(name: string, constraints?: SettingsPropTypeConstraint[], typeArguments?: SettingsPropType[]) {
        this.name = name;
        this.constraints = constraints;
        this.typeArguments = typeArguments;
    }

    public static parse(jsonObject: any): SettingsPropType {
        let name = jsonObject.name;

        let constraints: SettingsPropTypeConstraint[];
        let constraintsJson = jsonObject.constraints;
        if (constraintsJson) {
            constraints = [];
            for (var i = 0; i < constraintsJson.length; i++) {
                constraints.push({ type: constraintsJson[i]["@type"], value: constraintsJson[i].value });
            }
        }

        let typeArguments: SettingsPropType[];
        let typeArgumentsJson = jsonObject.typeArguments;
        if (typeArgumentsJson) {
            typeArguments = [];
            for (var i = 0; i < typeArgumentsJson.length; i++) {
                typeArguments.push(SettingsPropType.parse(typeArgumentsJson[i]));
            }
        }

        return new SettingsPropType(name, constraints, typeArguments);
    }

    public clone(): SettingsPropType {
        let constraints: SettingsPropTypeConstraint[];
        if (this.constraints) {
            constraints = [];
            for (var i = 0; i < this.constraints.length; i++) {
                constraints.push({ type: this.constraints[i].type, value: this.constraints[i].value });
            }
        }
        let typeArguments: SettingsPropType[];
        if (this.typeArguments) {
            typeArguments = [];
            for (var i = 0; i < this.typeArguments.length; i++) {
                typeArguments.push(this.typeArguments[i].clone());
            }
        }
        return new SettingsPropType(this.name, constraints, typeArguments);
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
    properties?: any; //object {"key1": "value", "key2": "value2", ...}
}


//Extension Point

export class ExtensionPointID {
    public static COLLABORATION_BACKEND_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.collaboration.CollaborationBackend";
    public static DATASET_METADATA_EXPORTER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.datasetmetadata.DatasetMetadataExporter";
    public static DEPLOYER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.deployer.Deployer"
    public static RDF_TRANSFORMERS_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.rdftransformer.RDFTransformer";
    public static REFORMATTING_EXPORTER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.reformattingexporter.ReformattingExporter";
    public static RENDERING_ENGINE_ID: string = "it.uniroma2.art.semanticturkey.plugin.extpts.RenderingEngine";
    // public static RENDERING_ENGINE_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.rendering.RenderingEngine";//NEW
    public static REPO_IMPL_CONFIGURER_PLUGIN_ID: string = "it.uniroma2.art.semanticturkey.plugin.extpts.RepositoryImplConfigurer";
    // public static REPO_IMPL_CONFIGURER_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.repositoryimplconfigurer.RepositoryImplConfigurer";//NEW
    public static SEARCH_STRATEGY_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.search.SearchStrategy";
    public static URI_GENERATOR_ID: string = "it.uniroma2.art.semanticturkey.plugin.extpts.URIGenerator";
    // public static URI_GENERATOR_ID: string = "it.uniroma2.art.semanticturkey.extension.extpts.urigen.URIGenerator";//NEW
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
    scope: Scope;
    interface: string;
    id: string;
    settingsScopes?: Scope[];
    configurationScopes?: Scope[];
}

export enum Scope {
    SYSTEM = "SYSTEM",
    PROJECT = "PROJECT",
    USER = "USER",
    PROJECT_USER = "PROJECT_USER"
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
        }
    }
}


export class FilteringStep {
    filter: {
        factoryId: string,
        configuration: {[key: string]: any}
    };
    graphs?: string[]
}