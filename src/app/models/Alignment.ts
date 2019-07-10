import { ARTURIResource, ARTNode, ARTResource } from "./ARTResources";

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

export class AlignmentOverview {
    onto1: string;
    onto2: string;
    unknownRelations: string[];
}

export class AlignmentRelationSymbol {
    relation: string;
    dlSymbol: string;
    text: string;

    static getKnownRelations(): string[] {
        return ["=", ">", "<", "%", "HasInstance", "InstanceOf"];
    }

    static getDefaultRelations(): AlignmentRelationSymbol[] {
        return [
            { relation: "=", dlSymbol: "\u2261", text: "equivalent" },
            { relation: ">", dlSymbol: "\u2292", text: "subsumes" },
            { relation: "<", dlSymbol: "\u2291", text: "is subsumed" },
            { relation: "%", dlSymbol: "\u22a5", text: "incompatible" },
            { relation: "HasInstance", dlSymbol: "\u2192", text: "has instance" },
            { relation: "InstanceOf", dlSymbol: "\u2190", text: "instance of" }
        ];
    }
}


export class Correspondence {
    identity: ARTResource;
    leftEntity: ARTNode[];
    rightEntity: ARTNode[];
    measure: ARTNode[];
    relation: ARTNode[];
}