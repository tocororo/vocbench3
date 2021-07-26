import { Configuration, Reference } from "./Configuration";

export class InvokableReporter extends Configuration {
    ref?: Reference; //not in the configuration object, but useful to keep trace of the id
}

export class InvokableReporterDefinition {
    label: string;
    description?: string;
    sections?: ServiceInvocationDefinition[];
    template: string;
    mimeType: string;
    filename?: string;
    additionalFiles?: AdditionalFile[];

    ref?: Reference; //not in the configuration definition, but useful to keep trace of its reference
}

export class AdditionalFile {
    sourcePath: string;
    destinationPath: string;
    required: boolean;
}

export class ServiceInvocation extends Configuration { }

export class ServiceInvocationDefinition {
    // '@type': string;
    extensionPath: string;
    service: string;
    operation: string;
    arguments?: { [key: string]: string };
    label: string;
    description: string;
    template: string;

    reporterRef?: Reference; //not in the operation definition, but usefult to keep trace of the belonging reporter
}

export class Report {
    label: string;
    description?: string;
    sections: Section[];
    template?: string;
    rendering?: string;
    mimeType?: string;
}
export class Section {
    service: string;
    operation: string;
    arguments?: { [key: string]: string };
    label?: string;
    description?: string;
    result?: any;
    exception?: any;
    template?: string;
    rendering?: string;
}