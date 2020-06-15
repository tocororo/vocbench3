import { RDFResourceRolesEnum } from "./ARTResources";
import { Configuration, Reference } from "./Configuration";
import { Scope } from "./Plugins";

export class ResourceMetadataAssociation {
    ref: string; 
    role: RDFResourceRolesEnum;
    pattern: PatternStruct;
}

export class ResourceMetadataPattern extends Configuration {}

export class ResourceMetadataPatternDefinition {
    description?: string;
    construction?: string;
    update?: string;
    destruction?: string;
}

export interface PatternStruct {
    reference: string; //complete relative reference
    scope: Scope; //project for project-local, system for system-wide shared, factory for factory-provided
    name: string; //the identifier from the reference
}

export class ResourceMetadataUtils {
    static convertReferenceToPatternStruct(reference: string): PatternStruct {
        return {
            reference: reference,
            scope: Reference.getRelativeReferenceScope(reference),
            name: Reference.getRelativeReferenceIdentifier(reference)
        }
    }
}