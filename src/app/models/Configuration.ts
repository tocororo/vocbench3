import { Settings, SettingsProp } from "./Plugins";

export class ConfigurationComponents {
    static SPARQL_STORE: string = "it.uniroma2.art.semanticturkey.config.sparql.SPARQLStore";
    static EXPORTER: string = "it.uniroma2.art.semanticturkey.config.exporter.Exporter";
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

/**
 * Soon Configuration will extends STProperties instead of Settings (like server side) and Settings also will extends STProperties
 */
export class Configuration extends Settings {}

export class ConfigurationProperty extends SettingsProp {}