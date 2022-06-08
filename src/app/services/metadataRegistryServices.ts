import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTLiteral, ARTURIResource, ResourcePosition } from '../models/ARTResources';
import { AbstractDatasetAttachment, CatalogRecord, CatalogRecord2, DatasetMetadata, Distribution, LexicalizationSetMetadata } from "../models/Metadata";
import { Deserializer } from '../utils/Deserializer';
import { STRequestParams } from '../utils/HttpManager';
import { StMetadataRegistry } from '../utils/STMetadataRegistry';

@Injectable()
export class MetadataRegistryServices {

    private serviceName = "MetadataRegistry";

    constructor(private httpMgr: StMetadataRegistry) { }

    /**
     * 
     * @param dataset 
     * @param lexicalizationModel 
     * @param language 
     * @param lexicalizationSet 
     * @param lexiconDataset 
     * @param references 
     * @param lexicalEntries 
     * @param lexicalizations 
     * @param percentage 
     * @param avgNumOfLexicalizations 
     */
    addEmbeddedLexicalizationSet(dataset: ARTURIResource, lexicalizationModel: ARTURIResource, language: string,
        lexicalizationSet?: ARTURIResource, lexiconDataset?: ARTURIResource, references?: number, lexicalEntries?: number,
        lexicalizations?: number, percentage?: number, avgNumOfLexicalizations?: number) {
        let params: STRequestParams = {
            dataset: dataset,
            lexicalizationModel: lexicalizationModel,
            language: language
        };
        if (lexicalizationSet != null) {
            params.lexicalizationSet = lexicalizationSet;
        }
        if (lexiconDataset != null) {
            params.lexiconDataset = lexiconDataset;
        }
        if (references != null) {
            params.references = references;
        }
        if (lexicalEntries != null) {
            params.lexicalEntries = lexicalEntries;
        }
        if (lexicalizations != null) {
            params.lexicalizations = lexicalizations;
        }
        if (percentage != null) {
            params.percentage = percentage;
        }
        if (avgNumOfLexicalizations != null) {
            params.avgNumOfLexicalizations = avgNumOfLexicalizations;
        }
        return this.httpMgr.doPost(this.serviceName, "addEmbeddedLexicalizationSet", params);
    }

    /**
     * 
     * @param lexicalizationSet 
     */
    deleteEmbeddedLexicalizationSet(lexicalizationSet: ARTURIResource) {
        let params: STRequestParams = {
            lexicalizationSet: lexicalizationSet
        };
        return this.httpMgr.doPost(this.serviceName, "deleteEmbeddedLexicalizationSet", params);
    }

    /**
     * 
     * @param dataset 
     */
    getEmbeddedLexicalizationSets(dataset: ARTURIResource): Observable<LexicalizationSetMetadata[]> {
        let params: STRequestParams = {
            dataset: dataset
        };
        return this.httpMgr.doGet(this.serviceName, "getEmbeddedLexicalizationSets", params);
    }

    /**
     * Sets the title of a dataset.
     * @param dataset 
     * @param title 
     */
    setTitle(dataset: ARTURIResource, title?: string) {
        let params: STRequestParams = {
            dataset: dataset,
        };
        if (title != null) {
            params.title = title;
        }
        return this.httpMgr.doPost(this.serviceName, "setTitle", params);
    }

    /**
     * Sets whether a dataset is derefereanceable or not. If value is true, then sets
     * mdreg:standardDereferenciation and if false sets mdreg:noDereferenciation. If
     * is not passed, the dereferenciation system is left unspecified.
     * @param dataset 
     * @param value 
     */
    setDereferenciability(dataset: ARTURIResource, value?: boolean) {
        let params: STRequestParams = {
            dataset: dataset,
        };
        if (value != null) {
            params.value = value;
        }
        return this.httpMgr.doPost(this.serviceName, "setDereferenciability", params);
    }

    /**
     * Sets the SPARQL endpoint of a dataset.
     * @param dataset 
     * @param endpoint If null the endpoint is left unspecified
     */
    setSPARQLEndpoint(dataset: ARTURIResource, endpoint?: ARTURIResource) {
        let params: STRequestParams = {
            dataset: dataset,
        };
        if (endpoint != null) {
            params.endpoint = endpoint;
        }
        return this.httpMgr.doPost(this.serviceName, "setSPARQLEndpoint", params);
    }

    /**
     * 
     * @param endpoint 
     * @param limitation 
     */
    setSPARQLEndpointLimitation(endpoint: ARTURIResource, limitation?: ARTURIResource) {
        let params: STRequestParams = {
            endpoint: endpoint,
        };
        if (endpoint != null) {
            params.limitation = limitation;
        }
        return this.httpMgr.doPost(this.serviceName, "setSPARQLEndpointLimitation", params);
    }

    /**
     * 
     * @param endpoint 
     * @param limitation 
     */
    removeSPARQLEndpointLimitation(endpoint: ARTURIResource, limitation?: ARTURIResource) {
        let params: STRequestParams = {
            endpoint: endpoint,
        };
        if (endpoint != null) {
            params.limitation = limitation;
        }
        return this.httpMgr.doPost(this.serviceName, "removeSPARQLEndpointLimitation", params);
    }

    /**
     * Deletes a catalog record
     * @param catalogRecord 
     */
    deleteCatalogRecord(catalogRecord: ARTURIResource) {
        let params: STRequestParams = {
            catalogRecord: catalogRecord,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteCatalogRecord", params);
    }

    /**
     * Deletes a dataset version
     * @param dataset 
     */
    deleteDatasetVersion(dataset: ARTURIResource) {
        let params: STRequestParams = {
            dataset: dataset,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteDatasetVersion", params);
    }

    /**
     * Returns the catalog records
     */
    getCatalogRecords(): Observable<CatalogRecord[]> {
        let params: STRequestParams = {};
        return this.httpMgr.doGet(this.serviceName, "getCatalogRecords", params).pipe(
            map(stResp => {
                let records: CatalogRecord[] = [];
                for (let i = 0; i < stResp.length; i++) {
                    records.push(CatalogRecord.deserialize(stResp[i]));
                }
                return records;
            })
        );
    }

    /**
     * 
     * @param dataset 
     */
    getDatasetMetadata(dataset: ARTURIResource): Observable<DatasetMetadata> {
        let params: STRequestParams = {
            dataset: dataset
        };
        return this.httpMgr.doGet(this.serviceName, "getDatasetMetadata", params).pipe(
            map(stResp => {
                return DatasetMetadata.deserialize(stResp);
            })
        );
    }

    /**
     * Consults the dataset (in the best possible way going from more to less noble availabilities:
     * localProject --> SPARQLendpoint --> http-dereferenciation) in order to assess its lexicalization model.
     * @param dataset 
     */
    assessLexicalizationModel(dataset: ARTURIResource) {
        let params: STRequestParams = {
            dataset: dataset,
        };
        return this.httpMgr.doPost(this.serviceName, "assessLexicalizationModel", params);
    }

    /**
     * Find a dataset matching the given IRI.
     * @param iri 
     */
    findDataset(iri: ARTURIResource): Observable<ResourcePosition> {
        let params: STRequestParams = {
            iri: iri,
        };
        return this.httpMgr.doGet(this.serviceName, "findDataset", params).pipe(
            map(resp => {
                return ResourcePosition.deserialize(resp);
            })
        );
    }

    /**
     * Discover the metadata for a dataset given an IRI. If discovery is unsuccessful, an exception is thrown.
     * Returns the id of the metadataDataset found.
     * @param iri 
     */
    discoverDataset(iri: ARTURIResource): Observable<ARTURIResource> {
        let params: STRequestParams = {
            iri: iri,
        };
        return this.httpMgr.doPost(this.serviceName, "discoverDataset", params).pipe(
            map(stResp => {
                return Deserializer.createURI(stResp);
            })
        );
    }

    /**
     * Returns metadata about the linksets sets embedded in a given dataset
     * @param dataset 
     * @param treshold minimum number of links (before linkset coalescing)
     * @param coalesce whether or not merge linksets for the same pair of datasets
     */
    getEmbeddedLinksets(dataset: ARTURIResource, treshold?: number, coalesce?: boolean) {
        let params: STRequestParams = {
            dataset: dataset,
            treshold: treshold,
            coalesce: coalesce
        };
        return this.httpMgr.doGet(this.serviceName, "getEmbeddedLinksets", params);
    }






    createAbstractDataset(datasetLocalName: string, uriSpace: string, title?: ARTLiteral, description?: ARTLiteral): Observable<ARTURIResource> {
        let params: STRequestParams = {
            datasetLocalName: datasetLocalName,
            uriSpace: uriSpace,
            title: title,
            description: description
        };
        return this.httpMgr.doPost(this.serviceName, "createAbstractDataset", params);
    }

    createConcreteDataset(datasetLocalName: string, uriSpace: string, title?: ARTLiteral, description?: ARTLiteral,
        dereferenceable?: boolean, distribution?: Distribution, abstractDatasetAttachment?: AbstractDatasetAttachment): Observable<ARTURIResource> {
        let params: STRequestParams = {
            datasetLocalName: datasetLocalName,
            uriSpace: uriSpace,
            title: title,
            description: description,
            dereferenceable: dereferenceable,
            distribution: new Map([
                ["nature", distribution.nature.getURI()],
                ["identity", distribution.identity],
                ["sparqlEndpoint", distribution.sparqlEndpoint],
                ["projectName", distribution.projectName]
            ]),
            abstractDatasetAttachment: abstractDatasetAttachment ? this.getAbstractDatasetAttachmentAsParam(abstractDatasetAttachment) : null
        };
        return this.httpMgr.doPost(this.serviceName, "createConcreteDataset", params);
    }

    listRootDatasets(): Observable<CatalogRecord2[]> {
        let params: STRequestParams = {};
        return this.httpMgr.doGet(this.serviceName, "listRootDatasets", params).pipe(
            map(resp => {
                let records: CatalogRecord2[] = resp.map((r: any) => CatalogRecord2.parse(r));
                return records;
            })
        );
    }

    listConnectedDatasets(abstractDataset: ARTURIResource): Observable<CatalogRecord2[]> {
        let params: STRequestParams = {
            abstractDataset: abstractDataset,
        };
        return this.httpMgr.doGet(this.serviceName, "listConnectedDatasets", params).pipe(
            map(resp => {
                let records: CatalogRecord2[] = resp.map((r: any) => CatalogRecord2.parse(r));
                return records;
            })
        );
    }

    connectToAbstractDataset(dataset: ARTURIResource, abstractDatasetAttachment: AbstractDatasetAttachment) {
        let params: STRequestParams = {
            dataset: dataset,
            abstractDatasetAttachment: this.getAbstractDatasetAttachmentAsParam(abstractDatasetAttachment),
        };
        return this.httpMgr.doPost(this.serviceName, "connectToAbstractDataset", params);
    }

    spawnNewAbstractDataset(dataset1: ARTURIResource, abstractDatasetAttachment1: AbstractDatasetAttachment,
        dataset2: ARTURIResource, abstractDatasetAttachment2: AbstractDatasetAttachment,
        datasetLocalName: string, uriSpace: string, title?: ARTLiteral, description?: ARTLiteral) {
        let params: STRequestParams = {
            dataset1: dataset1,
            abstractDatasetAttachment1: this.getAbstractDatasetAttachmentAsParam(abstractDatasetAttachment1),
            dataset2: dataset2,
            abstractDatasetAttachment2: this.getAbstractDatasetAttachmentAsParam(abstractDatasetAttachment2),
            datasetLocalName: datasetLocalName,
            uriSpace: uriSpace,
            title: title,
            description: description,
        };
        return this.httpMgr.doPost(this.serviceName, "spawnNewAbstractDataset", params);

    }

    private getAbstractDatasetAttachmentAsParam(abstractDatasetAttachment: AbstractDatasetAttachment): Map<string, string> {
        return new Map([
            ["abstractDataset", abstractDatasetAttachment.abstractDataset],
            ["relation", abstractDatasetAttachment.relation.getURI()],
            ["versionInfo", abstractDatasetAttachment.versionInfo],
            ["versionNotes", abstractDatasetAttachment.versionNotes ? abstractDatasetAttachment.versionNotes.toNT() : null]
        ]);
    }

}