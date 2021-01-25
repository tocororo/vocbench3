import { Deserializer } from "../utils/Deserializer";
import { ARTLiteral, ARTPredicateObjects, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute, ResourceNature, TripleScopes } from "./ARTResources";

export class LexicographerView {
    id: ARTURIResource;
    nature: ResourceNature[];
    morphosyntacticProps: ARTPredicateObjects[];
    lemma: Form[];
    otherForms: Form[];
    senses: Sense[];

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
    id: ARTURIResource;
    morphosyntacticProps: ARTPredicateObjects[];
    phoneticRep: ARTLiteral[];
    writtenRep: ARTLiteral[];
    nature: ResourceNature[];
    scope: TripleScopes;

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
    id: ARTURIResource;
    definition: ARTLiteral[] = [];
    reference: ARTResource[] = [];
    concept: ARTResource[] = [];

    public static parse(sJson: any): Sense {
        let s: Sense = new Sense();
        s.id = new ARTURIResource(sJson.id);
        if (sJson.definition) {
            s.definition = Deserializer.createLiteralArray(sJson.definition);
        }
        s.reference = Deserializer.createResourceArray(sJson.reference);
        s.concept = Deserializer.createResourceArray(sJson.concept);
        return s;
    }
}