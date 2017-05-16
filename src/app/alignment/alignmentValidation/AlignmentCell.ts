import { ARTURIResource } from "../../models/ARTResources";

export class AlignmentCell {

    private entity1: ARTURIResource;
    private entity2: ARTURIResource;
    private measure: number;
    private relation: string;
    private mappingProperty: ARTURIResource;
    private suggestedMappingProperties: Array<ARTURIResource>;
    private status: string;
    private comment: string;

    constructor(entity1: ARTURIResource, entity2: ARTURIResource, measure: number, relation: string) {
        this.entity1 = entity1;
        this.entity2 = entity2;
        this.measure = measure;
        this.relation = relation;
    }

    public setEntity1(entity1: ARTURIResource) {
        this.entity1 = entity1;
    }

    public getEntity1(): ARTURIResource {
        return this.entity1;
    }

    public setEntity2(entity2: ARTURIResource) {
        this.entity2 = entity2;
    }

    public getEntity2(): ARTURIResource {
        return this.entity2;
    }

    public setMeasure(measure: number) {
        this.measure = measure;
    }

    public getMeasure(): number {
        return this.measure;
    }

    public setRelation(relation: string) {
        this.relation = relation;
    }

    public getRelation(): string {
        return this.relation;
    }

    public setMappingProperty(prop: ARTURIResource) {
        this.mappingProperty = prop;
    }

    public getMappingProperty(): ARTURIResource {
        return this.mappingProperty;
    }

    public setSuggestedMappingProperties(properties: Array<ARTURIResource>) {
        this.suggestedMappingProperties = properties;
    }

    public getSuggestedMappingProperties(): Array<ARTURIResource> {
        return this.suggestedMappingProperties;
    }

    public setStatus(status: string) {
        this.status = status;
    }

    public getStatus(): string {
        return this.status;
    }

    public setComment(comment: string) {
        this.comment = comment;
    }

    public getComment(): string {
        return this.comment;
    }

}

// export type AlignmentRelation = "=" | ">" | "<" | "%" | "HasInstance" | "InstanceOf";
// export const AlignmentRelation = {
//     "=": "=" as AlignmentRelation,
//     ">": ">" as AlignmentRelation,
//     "<": "<" as AlignmentRelation,
//     "%": "%" as AlignmentRelation,
//     "HasInstance": "HasInstance" as AlignmentRelation,
//     "InstanceOf": "InstanceOf" as AlignmentRelation,
// };

// export type AlignmentStatus = "accepted" | "rejected" | "error";
// export const AlignmentStatus = {
//     "accepted": "accepted" as AlignmentStatus,
//     "rejected": "rejected" as AlignmentStatus,
//     "error": "error" as AlignmentStatus
// }