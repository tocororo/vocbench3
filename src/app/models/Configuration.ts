export class ConfigurationComponents {
    static SPARQL_STORE: string = "it.uniroma2.art.semanticturkey.config.sparql.SPARQLStore";
}

export class Reference {
    public user: string;
    public project: string;
    public identifier: string;
    public relativeReference: string;
}

export class ConfigurationManager {
    public id: string;
    public scope: string;
    public configurationScopes: string[];
    public systemConfigurationIdentifiers: any[]; //????
}

export class Configuration {
    public shortName: string;
    public type: string;
    public editRequired: boolean;
    public properties: ConfigurationProperty[];
    constructor(shortName: string, type: string, editRequired: boolean, properties: ConfigurationProperty[]) {
        this.shortName = shortName;
        this.editRequired = editRequired;
        this.type = type;
        this.properties = properties;
    }

}

export class ConfigurationProperty {
    public name: string;
    public description: string;
    public required: boolean;
    public value: string;
    public enumeration?: string[];
    public type?: string;
    constructor (name: string, description: string, required: boolean, value?: any, enumeration?: string[], type?: string) {
        this.description = description;
        this.name = name;
        this.required = required;
        this.value = value;
        this.enumeration = enumeration;
        this.type = type;
    }
}