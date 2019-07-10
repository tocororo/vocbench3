import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource, ResourcePosition } from '../models/ARTResources';
import { CatalogRecord, DatasetMetadata, LexicalizationSetMetadata } from "../models/Metadata";
import { Deserializer } from '../utils/Deserializer';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class MetadataRegistryServices {

    private serviceName = "MetadataRegistry";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Adds a abstract version of a void:Dataset together with the dcat:CatalogRecord.
     * @param uriSpace 
     * @param dataset if not passed, a local IRI is created
     * @param title 
     * @param sparqlEndpoint 
     * @param dereferenceable if true, set to mdreg:standardDereferenciation; if false, set to mdreg:noDereferenciation
     * @return the IRI of the dcat:CatalogRecord created for it
     */
    addDataset(uriSpace: string, dataset?: ARTURIResource, title?: string, sparqlEndpoint?: ARTURIResource, dereferenceable?: boolean) {
        var params: any = {
            uriSpace: uriSpace
        }
        if (dataset != null) {
            params.dataset = dataset;
        }
        if (title != null) {
            params.title = title;
        }
        if (sparqlEndpoint != null) {
            params.sparqlEndpoint = sparqlEndpoint;
        }
        if (dereferenceable != null) {
            params.dereferenceable = dereferenceable;
        }
        return this.httpMgr.doPost(this.serviceName, "addDataset", params);
    }

    /**
     * Adds dataset to the specified catalogRecord as a specific versionInfo.
     * @param catalogRecord 
     * @param versionInfo 
     * @param dataset if not passed, a local IRI is created
     */
    addDatasetVersion(catalogRecord: ARTURIResource, versionInfo: string, dataset?: ARTURIResource) {
        var params: any = {
            catalogRecord: catalogRecord,
            versionInfo: versionInfo
        }
        if (dataset != null) {
            params.dataset = dataset;
        }
        return this.httpMgr.doPost(this.serviceName, "addDatasetVersion", params);
    }

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
        var params: any = {
            dataset: dataset,
            lexicalizationModel: lexicalizationModel,
            language: language
        }
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
        var params: any = {
            lexicalizationSet: lexicalizationSet
        }
        return this.httpMgr.doPost(this.serviceName, "deleteEmbeddedLexicalizationSet", params);
    }

    /**
     * 
     * @param dataset 
     */
    getEmbeddedLexicalizationSets(dataset: ARTURIResource): Observable<LexicalizationSetMetadata[]> {
        var params: any = {
            dataset: dataset
        }
        return this.httpMgr.doGet(this.serviceName, "getEmbeddedLexicalizationSets", params);
    }

    /**
     * Sets the title of a dataset.
     * @param dataset 
     * @param title 
     */
    setTitle(dataset: ARTURIResource, title?: string) {
        var params: any = {
            dataset: dataset,
        }
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
        var params: any = {
            dataset: dataset,
        }
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
        var params: any = {
            dataset: dataset,
        }
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
        var params: any = {
            endpoint: endpoint,
        }
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
        var params: any = {
            endpoint: endpoint,
        }
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
        var params: any = {
            catalogRecord: catalogRecord,
        }
        return this.httpMgr.doPost(this.serviceName, "deleteCatalogRecord", params);
    }

    /**
     * Deletes a dataset version
     * @param dataset 
     */
    deleteDatasetVersion(dataset: ARTURIResource) {
        var params: any = {
            dataset: dataset,
        }
        return this.httpMgr.doPost(this.serviceName, "deleteDatasetVersion", params);
    }

    /**
     * Returns the catalog records
     */
    getCatalogRecords(): Observable<CatalogRecord[]> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getCatalogRecords", params).map(
            stResp => {
                let records: CatalogRecord[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    records.push(CatalogRecord.deserialize(stResp[i]));
                }
                return records;
            }
        );
    }

    /**
     * 
     * @param dataset 
     */
    getDatasetMetadata(dataset: ARTURIResource): Observable<DatasetMetadata> {
        var params: any = {
            dataset: dataset
        }
        return this.httpMgr.doGet(this.serviceName, "getDatasetMetadata", params).map(
            stResp => {
                return DatasetMetadata.deserialize(stResp);
            }
        );
    }

    /**
     * Consults the dataset (in the best possible way going from more to less noble availabilities:
	 * localProject --> SPARQLendpoint --> http-dereferenciation) in order to assess its lexicalization model.
     * @param dataset 
     */
    assessLexicalizationModel(dataset: ARTURIResource) {
        var params: any = {
            dataset: dataset,
        }
        return this.httpMgr.doPost(this.serviceName, "assessLexicalizationModel", params);
    }

    /**
     * Find a dataset matching the given IRI.
     * @param iri 
     */
    findDataset(iri: ARTURIResource): Observable<ResourcePosition> {
        var params: any = {
            iri: iri,
        }
        return this.httpMgr.doGet(this.serviceName, "findDataset", params).map(
            resp => {
                return ResourcePosition.deserialize(resp);
            }
        );
    }

    /**
     * Discover the metadata for a dataset given an IRI. If discovery is unsuccessful, an exception is thrown.
     * Returns the id of the metadataDataset found.
     * @param iri 
     */
    discoverDataset(iri: ARTURIResource): Observable<ARTURIResource> {
        var params: any = {
            iri: iri,
        }
        return this.httpMgr.doPost(this.serviceName, "discoverDataset", params).map(
            stResp => {
                return Deserializer.createURI(stResp);
            }
        );
    }

    /**
     * Returns metadata about the linksets sets embedded in a given dataset
     * @param dataset 
     * @param treshold minimum number of links (before linkset coalescing)
     * @param coalesce whether or not merge linksets for the same pair of datasets
     */
    getEmbeddedLinksets(dataset: ARTURIResource, treshold?: number, coalesce?: boolean) {
        var params: any = {
            dataset: dataset,
            treshold: treshold,
            coalesce: coalesce
        }
        return this.httpMgr.doGet(this.serviceName, "getEmbeddedLinksets", params);
    }

}