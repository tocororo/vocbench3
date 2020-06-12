import { RDFResourceRolesEnum } from "./ARTResources";
import { Configuration } from "./Configuration";

export class ResourceMetadataAssociation {
    ref: string; 
    role: RDFResourceRolesEnum;
    patternRef: string; 
}

export class ResourceMetadataPattern extends Configuration {}

export class ResourceMetadataPatternDefinition {
    description?: string;
    construction?: string;
    update?: string;
    destruction?: string;
}