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
    public params: PluginConfigParam[];
    constructor(shortName: string, type: string, editRequired: boolean, params: PluginConfigParam[]) {
        this.shortName = shortName;
        this.editRequired = editRequired;
        this.type = type;
        this.params = params;
    }

    public clone(): PluginConfiguration {
        var params: PluginConfigParam[] = [];
        for (var i = 0; i < this.params.length; i++) {
            let p: PluginConfigParam = this.params[i];
            params.push(new PluginConfigParam(p.name, p.description, p.required, p.value));
        }
        return new PluginConfiguration(this.shortName, this.type, this.editRequired, params);
    }
}

export class PluginConfigParam {
    public name: string;
    public description: string;
    public required: boolean;
    public value: any;
    constructor (name: string, description: string, required: boolean, value?: any) {
        this.description = description;
        this.name = name;
        this.required = required;
        this.value = value;
    }
}

export class PluginSpecification {
    factoryId: string;
    configType: string;
    properties: any; //object {"key1": "value", "key2": "value2", ...}
}