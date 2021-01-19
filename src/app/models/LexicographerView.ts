import { Deserializer } from "../utils/Deserializer";
import { ARTLiteral, ARTResource } from "./ARTResources";

export class LexicographerView {
    id: string;
    lemma: Form[];
    otherForms: Form[];
    senses: Sense[];

    public static parse(lvJson: any): LexicographerView {
        let lv: LexicographerView = new LexicographerView();
        
        lv.id = lvJson.id;

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
    id: string;
    phoneticRep: ARTLiteral[];
    writtenRep: ARTLiteral[];

    public static parse(fJson: any): Form {
        let f: Form = new Form();
        f.id = fJson.id;
        f.phoneticRep = Deserializer.createLiteralArray(fJson.phoneticRep);
        f.writtenRep = Deserializer.createLiteralArray(fJson.writtenRep);
        return f;
    }
}

export class Sense {
    id: string;
    definition: ARTLiteral[];
    reference: ARTResource[];
    concept: ARTResource[];

    public static parse(sJson: any): Sense {
        let s: Sense = new Sense();
        s.id = sJson.id;
        s.definition = Deserializer.createLiteralArray(sJson.definition);
        s.reference = Deserializer.createResourceArray(sJson.definition);
        s.concept = Deserializer.createResourceArray(sJson.definition);
        return s;
    }
}