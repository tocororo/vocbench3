import { RDFResourceRolesEnum } from './ARTResources';
import { OntoLex, OWL, RDFS, SKOS } from './Vocabulary';

export class DataStructureUtils {

    static readonly panelTranslationMap: {[role: string]: string} = {
        [RDFResourceRolesEnum.cls]: 'DATA.CLASS.CLASS',
        [RDFResourceRolesEnum.concept]: 'DATA.CONCEPT.CONCEPT',
        [RDFResourceRolesEnum.conceptScheme]: 'DATA.SCHEME.SCHEME',
        [RDFResourceRolesEnum.skosCollection]: 'DATA.COLLECTION.COLLECTION',
        [RDFResourceRolesEnum.property]: 'DATA.PROPERTY.PROPERTY',
        [RDFResourceRolesEnum.limeLexicon]: 'DATA.LEXICON.LEXICON',
        [RDFResourceRolesEnum.ontolexLexicalEntry]: 'DATA.LEX_ENTRY.LEX_ENTRY',
        [RDFResourceRolesEnum.dataRange]: 'DATA.DATATYPE.DATATYPE'
    };

    static readonly modelPanelsMap: { [key: string]: RDFResourceRolesEnum[] } = {
        [RDFS.uri]: [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.property, RDFResourceRolesEnum.dataRange],
        [OWL.uri]: [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.property, RDFResourceRolesEnum.dataRange],
        [SKOS.uri]: [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme, 
            RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.property, RDFResourceRolesEnum.dataRange],
        [OntoLex.uri]: [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme, 
            RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.property, RDFResourceRolesEnum.limeLexicon, 
            RDFResourceRolesEnum.ontolexLexicalEntry, RDFResourceRolesEnum.dataRange],
    };

    static readonly panelsPriority: { [key: string]: RDFResourceRolesEnum[] } = {
        [RDFS.uri]: [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.property],
        [OWL.uri]: [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.property],
        [SKOS.uri]: [RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme, RDFResourceRolesEnum.skosCollection],
        [OntoLex.uri]: [RDFResourceRolesEnum.limeLexicon, RDFResourceRolesEnum.ontolexLexicalEntry, RDFResourceRolesEnum.concept, 
            RDFResourceRolesEnum.conceptScheme]
    };
}