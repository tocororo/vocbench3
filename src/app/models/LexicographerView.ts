import { Deserializer } from "../utils/Deserializer";
import { ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, ResourceNature, TripleScopes } from "./ARTResources";
import { SemanticTurkey } from "./Vocabulary";

export class LexicographerView {
    id: ARTResource;
    nature: ResourceNature[];
    morphosyntacticProps: ARTPredicateObjects[];
    lemma: Form[];
    otherForms: Form[];
    senses: Sense[];

    isInStaging(): boolean {
        return this.isInStagingAdd() || this.isInStagingRemove();
    }
    isInStagingAdd(): boolean {
        for (let n of this.nature) {
            if (n.graphs.some(g => g.getURI().startsWith(SemanticTurkey.stagingAddGraph))) {
                return true;
            }
        }
        return false;
    }
    isInStagingRemove(): boolean {
        for (let n of this.nature) {
            if (n.graphs.some(g => g.getURI().startsWith(SemanticTurkey.stagingRemoveGraph))) {
                return true;
            }
        }
        return false;
    }

    public static parse(lvJson: any): LexicographerView {
        let lv: LexicographerView = new LexicographerView();

        lv.id = new ARTURIResource(lvJson.id);
        lv.nature = ResourceNature.parse(lvJson.nature);
        
        lv.morphosyntacticProps = Deserializer.createPredicateObjectsList(lvJson.morphosyntacticProps);

        let lemma: Form[] = [];
        for (let f of lvJson.lemma) {
            lemma.push(Form.parse(f));
        }
        lv.lemma = lemma;

        let otherForms: Form[] = [];
        for (let f of lvJson.otherForms) {
            otherForms.push(Form.parse(f));
        }
        lv.otherForms = otherForms;

        let senses: Sense[] = [];
        for (let s of lvJson.senses) {
            senses.push(Sense.parse(s));
        }
        lv.senses = senses;

        return lv;
    }
}

export class Form {
    id: ARTResource;
    morphosyntacticProps: ARTPredicateObjects[];
    phoneticRep: ARTLiteral[];
    writtenRep: ARTLiteral[];
    nature: ResourceNature[];
    scope: TripleScopes;

    isInStaging(): boolean {
        return this.isInStagingAdd() || this.isInStagingRemove();
    }
    isInStagingAdd(): boolean {
        for (let n of this.nature) {
            if (n.graphs.some(g => g.getURI().startsWith(SemanticTurkey.stagingAddGraph))) {
                return true;
            }
        }
        return false;
    }
    isInStagingRemove(): boolean {
        for (let n of this.nature) {
            if (n.graphs.some(g => g.getURI().startsWith(SemanticTurkey.stagingRemoveGraph))) {
                return true;
            }
        }
        return false;
    }

    public static parse(fJson: any): Form {
        let f: Form = new Form();
        f.id = new ARTURIResource(fJson.id);
        f.nature = ResourceNature.parse(fJson.nature);
        f.morphosyntacticProps = Deserializer.createPredicateObjectsList(fJson.morphosyntacticProps);
        f.phoneticRep = Deserializer.createLiteralArray(fJson.phoneticRep);
        f.writtenRep = Deserializer.createLiteralArray(fJson.writtenRep);
        f.scope = fJson.scope;
        return f;
    }

}

export class Sense {
    id: ARTResource;
    definition: ARTNode[] = [];
    reference: ARTResource[] = [];
    concept: ConceptReference[] = [];

    public static parse(sJson: any): Sense {
        let s: Sense = new Sense();
        s.id = new ARTURIResource(sJson.id);
        if (sJson.definition) {
            s.definition = Deserializer.createRDFNodeArray(sJson.definition);
        }
        s.reference = Deserializer.createResourceArray(sJson.reference);
        s.concept = [];
        for (let cJson of sJson.concept) {
            s.concept.push(ConceptReference.parse(cJson));
        }
        return s;
    }
}

export class ConceptReference {
    id: ARTResource;
    nature: ResourceNature[];
    scope: TripleScopes;
    definition: ARTNode[];

    public static parse(cJson: any): ConceptReference {
        let c: ConceptReference = new ConceptReference();
        c.id = new ARTURIResource(cJson.id);
        c.nature = ResourceNature.parse(cJson.nature);
        c.scope = cJson.scope;
        if (cJson.definition) {
            c.definition = Deserializer.createRDFNodeArray(cJson.definition);
        }
        return c;
    }
}