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