import { Settings, SettingsProp, Scope } from "./Plugins";

export class ConfigurationComponents {
    static EXPORTER: string = "it.uniroma2.art.semanticturkey.config.exporter.Exporter";
    static IMPORTER: string = "it.uniroma2.art.semanticturkey.config.importer.Importer";
    static SPARQL_PARAMETERIZATION_STORE: string = "it.uniroma2.art.semanticturkey.config.sparql.SPARQLParameterizationStore";
    static SPARQL_STORE: string = "it.uniroma2.art.semanticturkey.config.sparql.SPARQLStore";
}

export class Reference {
    public user: string;
    public project: string;
    public identifier: string;
    public relativeReference: string;

    constructor(user: string, project: string, identifier: string, relativeReference: string) {
        this.user = user;
        this.project = project;
        this.identifier = identifier;
        this.relativeReference = relativeReference;
    }

    public getReferenceScope(): Scope {
        if (this.relativeReference.startsWith("sys:")) {
            return Scope.SYSTEM;
        } else if (this.relativeReference.startsWith("proj:")) {
            return Scope.PROJECT;
        } else if (this.relativeReference.startsWith("usr:")) {
            return Scope.USER;
        } else if (this.relativeReference.startsWith("pu:")) {
            return Scope.PROJECT_USER;
        }
    }

    public static deserialize(refJson: any): Reference {
        return new Reference(refJson.user, refJson.project, refJson.identifier, refJson.relativeReference);
    }
}

export class ConfigurationManager {
    public id: string;
    public scope: Scope;
    public configurationScopes: Scope[];
    public systemConfigurationIdentifiers: any[]; //????
}

/**
 * Soon Configuration will extends STProperties instead of Settings (like server side) and Settings also will extends STProperties
 */
export class Configuration extends Settings {}

export class ConfigurationProperty extends SettingsProp {}