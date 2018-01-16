/**
 * in the future this could have also a description field
 */
export class Plugin {
    public factoryID: string;
    constructor(factoryID: string) {
        this.factoryID = factoryID;
    }
}

export class PluginConfiguration {
    public shortName: string;
    public type: string;
    public editRequired: boolean;
    public properties: PluginConfigProp[];
    constructor(shortName: string, type: string, editRequired: boolean, properties: PluginConfigProp[]) {
        this.shortName = shortName;
        this.editRequired = editRequired;
        this.type = type;
        this.properties = properties;
    }

    public clone(): PluginConfiguration {
        var properties: PluginConfigProp[] = [];
        for (var i = 0; i < this.properties.length; i++) {
            let p: PluginConfigProp = this.properties[i];
            properties.push(new PluginConfigProp(p.name, p.description, p.required, p.value, p.enumeration));
        }
        return new PluginConfiguration(this.shortName, this.type, this.editRequired, properties);
    }

    public requireConfiguration(): boolean {
        if (this.editRequired) {
            for (var i = 0; i < this.properties.length; i++) {
                if (this.properties[i].required && (this.properties[i].value == null || this.properties[i].value.trim() == "")) {
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
            if (value != null && value == "") { //if user write then delete a value, the value is "", in this case "clear" the value
                value = undefined;
            }
            map[this.properties[i].name] = value;
        }
        return map;
    }

    public static parse(response: any): PluginConfiguration {
        let props: PluginConfigProp[] = [];
        for (var i = 0; i < response.properties.length; i++) {
            let name = response.properties[i].name;
            let description = response.properties[i].description;
            let required = response.properties[i].required;
            let value = response.properties[i].value;
            let enumeration = response.properties[i].enumeration;
            props.push(new PluginConfigProp(name, description, required, value, enumeration));
        }
        let stProps = new PluginConfiguration(response.shortName, response['@type'], response.editRequired, props);
        return stProps;
    }
}

export class PluginConfigProp {
    public name: string;
    public description: string;
    public required: boolean;
    public value: any;
    public enumeration: string[];
    constructor (name: string, description: string, required: boolean, value?: any, enumeration?: string[]) {
        this.description = description;
        this.name = name;
        this.required = required;
        this.value = value;
        this.enumeration = enumeration;
    }
}

export class PluginSpecification {
    factoryId: string;
    configType: string;
    properties: any; //object {"key1": "value", "key2": "value2", ...}
}

export class ExtensionPoint {
    public static EXPORT_FILTER_ID: string = "it.uniroma2.art.semanticturkey.plugin.extpts.ExportFilter";
    public static DATASET_METADATA_EXPORTER_ID: string = "it.uniroma2.art.semanticturkey.plugin.extpts.DatasetMetadataExporter";
    public static RENDERING_ENGINE_ID: string = "it.uniroma2.art.semanticturkey.plugin.extpts.RenderingEngine";
    public static URI_GENERATOR_ID: string = "it.uniroma2.art.semanticturkey.plugin.extpts.URIGenerator";
    public static REPO_IMPL_CONFIGURER_ID: string = "it.uniroma2.art.semanticturkey.plugin.extpts.RepositoryImplConfigurer";
    public static COLLABORATION_BACKEND_ID: string = "it.uniroma2.art.semanticturkey.plugin.extpts.CollaborationBackend";
}