import { Configuration } from "./Configuration";

export class InvokableReporter extends Configuration {
    id?: string; //not in the configuration object, but useful to keep trace of the id
}

export class InvokableReporterDefinition {
    label: string;
    description?: string;
    serviceInvocations?: ServiceInvocationDefinition[];
    id?: string; //not in the configuration definition, but useful to keep trace of the id
}

export class ServiceInvocation extends Configuration {}

export class ServiceInvocationDefinition {
    // '@type': string;
    service: string;
    operation: string;
    arguments: string[];
    reporterId?: string; //not in the operation definition, but usefult to keep trace of the belonging reporter
}

export class Report {
    label: string;
    description: string;
    sections: Section[];
}
export class Section {
    result: any;
}