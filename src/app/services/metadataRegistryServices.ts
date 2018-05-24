import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource, ResourcePosition } from '../models/ARTResources';
import { CatalogRecord } from "../models/Metadata";
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
        console.log("[MetadataRegistryServices] addDatasetMetadata");
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
        console.log("[MetadataRegistryServices] addDatasetVersion");
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
     * Sets whether a dataset is derefereanceable or not. If value is true, then sets
	 * mdreg:standardDereferenciation and if false sets mdreg:noDereferenciation. If
	 * is not passed, the dereferenciation system is left unspecified.
     * @param dataset 
     * @param value 
     */
    setDereferenciability(dataset: ARTURIResource, value?: boolean) {
        console.log("[MetadataRegistryServices] setDereferenciability");
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
        console.log("[MetadataRegistryServices] setSPARQLEndpoint");
        var params: any = {
            dataset: dataset,
        }
        if (endpoint != null) {
            params.endpoint = endpoint;
        }
        return this.httpMgr.doPost(this.serviceName, "setSPARQLEndpoint", params);
    }

    /**
     * Deletes a catalog record
     * @param catalogRecord 
     */
    deleteCatalogRecord(catalogRecord: ARTURIResource) {
        console.log("[MetadataRegistryServices] deleteCatalogRecord");
        var params: any = {
            catalogRecord: catalogRecord,
        }
        return this.httpMgr.doPost(this.serviceName, "deleteCatalogRecord", params);
    }

    /**
     * Deletes a dataset version
     * @param dataset 
     */
    deleteDatasetVersions(dataset: ARTURIResource) {
        console.log("[MetadataRegistryServices] deleteDatasetVersions");
        var params: any = {
            dataset: dataset,
        }
        return this.httpMgr.doPost(this.serviceName, "deleteDatasetVersions", params);
    }

    /**
     * Returns the catalog records
     */
    getCatalogRecords(): Observable<CatalogRecord[]> {
        console.log("[MetadataRegistryServices] getCatalogRecords");
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getCatalogRecords", params);
    }

    /**
     * Consults the dataset (in the best possible way going from more to less noble availabilities:
	 * localProject --> SPARQLendpoint --> http-dereferenciation) in order to assess its lexicalization model.
     * @param dataset 
     */
    assessLexicalizationModel(dataset: ARTURIResource) {
        console.log("[MetadataRegistryServices] assessLexicalizationModel");
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
        console.log("[MetadataRegistryServices] findDataset");
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
        console.log("[MetadataRegistryServices] discoverDataset");
        var params: any = {
            iri: iri,
        }
        return this.httpMgr.doPost(this.serviceName, "discoverDataset", params).map(
            stResp => {
                return Deserializer.createURI(stResp);
            }
        );
    }

}