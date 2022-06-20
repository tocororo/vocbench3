import { NTriplesUtil } from "../utils/ResourceUtils";
import { ARTLiteral, ARTURIResource } from "./ARTResources";
import { Project } from './Project';

export class PrefixMapping {
    public prefix: string;
    public namespace: string;
    public explicit: boolean = true;
}

export class LinksetMetadata {
    sourceDataset: ARTURIResource;
    targetDataset: Target;
    registeredTargets: Target[];
    linkCount?: number;
    linkPercentage?: number;
    linkPredicate?: ARTURIResource;

    sourceDatasetProject?: Project; //this is not included in the linkset returned by the services, 
    //this is added manually since it is useful when describing mapping from the Alignment tree

    /**
     * Returns in order (with fallback):
     * - the first registeredTargets with project name
     * - the first registeredTargets with uri space
     * - the targetDataset 
     */
    getRelevantTargetDataset(): Target {
        for (let i = 0; i < this.registeredTargets.length; i++) {
            if (this.registeredTargets[i].projectName != null) {
                return this.registeredTargets[i];
            }
        }
        //no project name found => returns uri space of registered targets
        for (let i = 0; i < this.registeredTargets.length; i++) {
            if (this.registeredTargets[i].uriSpace != null) {
                return this.registeredTargets[i];
            }
        }
        return this.targetDataset;
    }

    /**
     * If specified in the registered targets, returns the first target with the projectName, otherwise returns null.
     */
    getTargetProject(): Project {
        for (let t of this.registeredTargets) {
            if (t.projectName != null) {
                return new Project(t.projectName);
            }
        }
        return null;
    }

    /**
     * Returns the show of the relevant target dataset
     */
    getTargetDatasetShow(): string {
        let target = this.getRelevantTargetDataset();
        if (target.projectName != null) {
            return target.projectName;
        } else {
            return target.uriSpace;
        }
    }

}

export class Target {
    dataset: ARTURIResource;
    projectName: string;
    uriSpace?: string;
    titles: ARTLiteral[];
}

export class OntologyImport {
    public id: string;
    public status: ImportStatus;
    public imports: OntologyImport[];
}

export interface OntologyMirror {
    file: string;
    baseURI: string;
}

export enum ImportStatus {
    OK = "OK",
    FAILED = "FAILED",
    STAGED_ADDITION = "STAGED_ADDITION",
    STAGED_REMOVAL = "STAGED_REMOVAL",
    LOOP = "LOOP"
}

export enum ImportType {
    fromWeb = "fromWeb",
    fromWebToMirror = "fromWebToMirror",
    fromLocalFile = "fromLocalFile",
    fromOntologyMirror = "fromOntologyMirror",
    toOntologyMirror = "toOntologyMirror"
}

export enum TransitiveImportMethodAllowance {
    web = "web",
    webFallbackToMirror = "webFallbackToMirror",
    mirrorFallbackToWeb = "mirrorFallbackToWeb",
    mirror = "mirror",
    nowhere = "nowhere"
}

export class TransitiveImportUtils {
    static importAllowancesList: { allowance: TransitiveImportMethodAllowance, showTranslationKey: string }[] = [
        { allowance: TransitiveImportMethodAllowance.nowhere, showTranslationKey: "METADATA.NAMESPACES_AND_IMPORTS.TRANSITIVE_IMPORTS.FROM_OPT.NOWHERE" },
        { allowance: TransitiveImportMethodAllowance.web, showTranslationKey: "METADATA.NAMESPACES_AND_IMPORTS.TRANSITIVE_IMPORTS.FROM_OPT.WEB" },
        { allowance: TransitiveImportMethodAllowance.webFallbackToMirror, showTranslationKey: "METADATA.NAMESPACES_AND_IMPORTS.TRANSITIVE_IMPORTS.FROM_OPT.WEB_FALLBACK_MIRROR" },
        { allowance: TransitiveImportMethodAllowance.mirror, showTranslationKey: "METADATA.NAMESPACES_AND_IMPORTS.TRANSITIVE_IMPORTS.FROM_OPT.MIRROR" },
        { allowance: TransitiveImportMethodAllowance.mirrorFallbackToWeb, showTranslationKey: "METADATA.NAMESPACES_AND_IMPORTS.TRANSITIVE_IMPORTS.FROM_OPT.MIRROR_FALLBACK_WEB" }
    ];
}

export class DatasetMetadata {
    identity: ARTURIResource;
    distribution?: ARTURIResource;
    uriSpace?: string;
    title?: string;
    description?: string;
    dereferenciationSystem?: string;
    sparqlEndpointMetadata?: SparqlEndpointMetadata;
    versionInfo?: string;

    public static deserialize(datasetMetadataJson: any): DatasetMetadata {
        let sparqlEndpointMetadata: SparqlEndpointMetadata = SparqlEndpointMetadata.deserialize(datasetMetadataJson.sparqlEndpointMetadata);
        return {
            identity: new ARTURIResource(datasetMetadataJson.identity),
            distribution: datasetMetadataJson.distribution ? new ARTURIResource(datasetMetadataJson.distribution) : null,
            uriSpace: datasetMetadataJson.uriSpace,
            title: datasetMetadataJson.title,
            dereferenciationSystem: datasetMetadataJson.dereferenciationSystem,
            sparqlEndpointMetadata: sparqlEndpointMetadata,
            versionInfo: datasetMetadataJson.versionInfo
        };
    }
}

export class CatalogRecord2 {
    identity: ARTURIResource;
    dataset: DatasetMetadata2;
    issued: Date;
    modified?: Date;

    public static parse(catalogRecordJson: any): CatalogRecord2 {
        let record = new CatalogRecord2();
        record.identity = new ARTURIResource(catalogRecordJson.identity);
        record.dataset = DatasetMetadata2.parse(catalogRecordJson.dataset);
        record.issued = new Date(catalogRecordJson.issued);
        record.modified = catalogRecordJson.modified ? new Date(catalogRecordJson.modified) : null;
        return record;
    }
}

export class DatasetMetadata2 {

    identity: ARTURIResource;
    uriSpace: string;
    otherURISpaces: string[];
    nature: DatasetNature;
    titles: ARTLiteral[];
    projectName?: string;
    descriptions: ARTLiteral[];
    role: DatasetRole;
    versionInfo: string;
    versionNotes: string;
    dereferenciationSystem?: string;
    sparqlEndpoint?: SparqlEndpointMetadata;

    public static parse(datasetMetadataJson: any): DatasetMetadata2 {
        let dataset = new DatasetMetadata2();
        dataset.identity = new ARTURIResource(datasetMetadataJson.identity);
        dataset.uriSpace = datasetMetadataJson.uriSpace;
        dataset.otherURISpaces = datasetMetadataJson.otherURISpaces;
        dataset.nature = datasetMetadataJson.nature;
        dataset.titles = datasetMetadataJson.titles.map((t: string) => NTriplesUtil.parseLiteral(t));
        dataset.projectName = datasetMetadataJson.projectName;
        dataset.descriptions = datasetMetadataJson.descriptions.map((d: string) => NTriplesUtil.parseLiteral(d));
        dataset.role = datasetMetadataJson.role;
        dataset.versionInfo = datasetMetadataJson.versionInfo;
        dataset.versionNotes = datasetMetadataJson.versionNotes;
        dataset.sparqlEndpoint = SparqlEndpointMetadata.deserialize(datasetMetadataJson.sparqlEndpoint);
        dataset.dereferenciationSystem = datasetMetadataJson.dereferenciationSystem;
        return dataset;
    }
}

export enum DatasetNature {
    ABSTRACT = "ABSTRACT",
    PROJECT = "PROJECT",
    SPARQL_ENDPOINT = "SPARQL_ENDPOINT",
    RDF4J_REPOSITORY = "RDF4J_REPOSITORY",
    GRAPHDB_REPOSITORY = "GRAPHDB_REPOSITORY",
    MIX = "MIX"
}

export enum DatasetRole {
    ROOT = "ROOT",
    VERSION = "VERSION",
    MASTER = "MASTER",
    LOD = "LOD"
}

export interface Distribution {
    nature: ARTURIResource;
    //according the nature, the following are required
    identity?: string;
    sparqlEndpoint?: string;
    projectName?: string;
}

export interface AbstractDatasetAttachment {
    abstractDataset: string;
    relation: ARTURIResource;
    versionInfo?: string;
    versionNotes?: ARTLiteral;
}

export class SparqlEndpointMetadata {
    id: string;
    limitations?: string[];
    public static deserialize(metadataJson: any): SparqlEndpointMetadata {
        if (metadataJson) {
            return {
                id: metadataJson['@id'],
                limitations: metadataJson.limitations
            };
        } else {
            return { id: null, limitations: null };
        }

    }
}

export class LexicalizationSetMetadata {
    public identity: string;
    public referenceDataset: string;
    public lexiconDataset?: string;
    public lexicalizationModel: string;
    public language: string;
    public references?: number;
    public lexicalEntries?: number;
    public lexicalizations?: number;
    public percentage?: number;
    public avgNumOfLexicalizations?: number;
}

export class ConnectorsID {
    public static LOVConnector_ID: string = "it.uniroma2.art.semanticturkey.extension.impl.metadatarepository.lov.LOVConnector";
    public static LODCloudConnector_ID: string = "it.uniroma2.art.semanticturkey.extension.impl.metadatarepository.lodcloud.LODCloudConnector";
}

export abstract class AbstractDataset implements Descriptable {
    id: string;
    ontologyIRI: ARTURIResource; //or ARTURI?
    datasetPage: string;
    titles: ARTLiteral[];
    descriptions: ARTLiteral[];
    facets: DatasetSearchFacets;

    constructor(id: string) {
        this.id = id;
    }

    private prefTitle: ARTLiteral;
    private prefDescription: ARTLiteral;
    getPreferredTitle(): ARTLiteral {
        if (this.prefTitle == null) {
            this.prefTitle = DescriptionHelper.computePreferredTitle(this);
        }
        return this.prefTitle;
    }
    getPreferredDescription(): ARTLiteral {
        if (this.prefDescription == null) {
            this.prefDescription = DescriptionHelper.computePreferredDescription(this);
        }
        return this.prefDescription;
    }
}

export class DatasetDescription extends AbstractDataset {
    uriPrefix: string;
    dataDumps: DownloadDescription[];
    sparqlEndpoint: string;
    model: string;
    lexicalizationModel: string;
}

export class DownloadDescription implements Descriptable {
    constructor(accessURL: string) {
        this.accessURL = accessURL;
    }
    accessURL: string;
    descriptions?: ARTLiteral[];
    mimeType?: string;
    titles?: ARTLiteral[];

    private prefTitle: ARTLiteral;
    private prefDescription: ARTLiteral;
    getPreferredTitle(): ARTLiteral {
        if (this.prefTitle == null) {
            this.prefTitle = DescriptionHelper.computePreferredTitle(this);
        }
        return this.prefTitle;
    }
    getPreferredDescription(): ARTLiteral {
        if (this.prefDescription == null) {
            this.prefDescription = DescriptionHelper.computePreferredDescription(this);
        }
        return this.prefDescription;
    }

    public static deserialize(descrJson: any): DownloadDescription {
        let titles: ARTLiteral[] = [];
        if (descrJson.titles != null) {
            descrJson.titles.forEach((t: string) => {
                titles.push(NTriplesUtil.parseLiteral(t));
            });
        }
        let descriptions: ARTLiteral[] = [];
        if (descrJson.descriptions != null) {
            descrJson.descriptions.forEach((d: string) => {
                descriptions.push(NTriplesUtil.parseLiteral(d));
            });
        }
        let desc: DownloadDescription = new DownloadDescription(descrJson.accessURL);
        desc.mimeType = descrJson.mimeType;
        desc.titles = titles;
        desc.descriptions = descriptions;
        return desc;
    }
}

export class DatasetSearchResult extends AbstractDataset {
    score: number;
}

export class SearchResultsPage<T> {
    totalResults: number;
    pageSize: number;
    page: number;
    tail: boolean;
    content: T[];
    facetAggregations: FacetAggregation[];
}

export class DatasetSearchFacets {
    [key: string]: string[]
}

export class FacetAggregation {
    name: string;
    displayName?: string;
    selectionMode: SelectionMode;
    buckets: Bucket[];
    others: boolean;
}

export enum SelectionMode {
    disabled, single, multiple
}

export class Bucket {
    name: string;
    displayname?: string;
    count: number;
}


interface Descriptable {
    titles?: ARTLiteral[];
    descriptions?: ARTLiteral[];
}

class DescriptionHelper {
    public static computePreferredTitle(descripted: Descriptable): ARTLiteral {
        let prefTitle: ARTLiteral = descripted.titles[0]; //set by default the first title
        if (descripted.titles.length > 1) {
            langLoop: for (let i = 0; i < navigator.languages.length; i++) { //for each language look for the title
                for (let j = 0; j < descripted.titles.length; j++) {
                    if (descripted.titles[j].getLang() == navigator.languages[i]) {
                        prefTitle = descripted.titles[j];
                        break langLoop;
                    }
                }
            }
        }
        return prefTitle;
    }
    public static computePreferredDescription(descripted: Descriptable): ARTLiteral {
        let prefDescription: ARTLiteral = descripted.descriptions[0]; //set by default the first description
        if (descripted.descriptions.length > 1) {
            langLoop: for (let i = 0; i < navigator.languages.length; i++) { //for each language look for the description
                for (let j = 0; j < descripted.descriptions.length; j++) {
                    if (descripted.descriptions[j].getLang() == navigator.languages[i]) {
                        prefDescription = descripted.descriptions[j];
                        break langLoop;
                    }
                }
            }
        }
        return prefDescription;
    }
}