import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DatasetDescription, DatasetSearchFacets, DatasetSearchResult, SearchResultsPage } from '../models/Metadata';
import { HttpManager } from "../utils/HttpManager";
import { ARTLiteral, ResourceUtils } from '../models/ARTResources';
import { resolvePtr } from 'dns';

@Injectable()
export class DatasetCatalogsServices {

    private serviceName = "DatasetCatalogs";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Searched a dataset in the connected repository matching the given criteria
     * @param connectorId 
     * @param query 
     * @param facets 
     * @param page 
     */
    searchDataset(connectorId: string, query: string, facets: DatasetSearchFacets, page: number): Observable<SearchResultsPage<DatasetSearchResult>>{
        console.log("[DatasetCatalogsServices] searchDataset");
        var params: any = {
            connectorId: connectorId,
            query: query,
            facets: JSON.stringify(facets),
            page: page
        };
        return this.httpMgr.doGet(this.serviceName, "searchDataset", params).map(
            resp => {
                let content: DatasetSearchResult[] = [];
                resp.content.forEach((c: any) => {
                    let titles: ARTLiteral[] = [];
                    c.titles.forEach((t: string) => {
                        titles.push(ResourceUtils.parseLiteral(t));
                    });
                    let descriptions: ARTLiteral[] = [];
                    c.descriptions.forEach((d: string) => {
                        descriptions.push(ResourceUtils.parseLiteral(d));
                    });
                    let dsr: DatasetSearchResult = new DatasetSearchResult(c.id);
                    dsr.datasetPage = c.datasetPage;
                    dsr.descriptions = descriptions;
                    dsr.facets = c.facets;
                    dsr.ontologyIRI = (c.ontologyIRI != null) ? ResourceUtils.parseURI(c.ontologyIRI) : null;
                    dsr.score = c.score;
                    dsr.titles = titles;
                    content.push(dsr);
                })
                let resPage: SearchResultsPage<DatasetSearchResult> = {
                    content: content,
                    page: resp.page,
                    pageSize: resp.pageSize,
                    totalResults: resp.totalResults,
                    tail: resp.tail
                };
                return resPage;
            }
        );
    }

    /**
     * Returns the description of a given dataset provided by the connected repository
     * @param connectorId 
     * @param datasetId 
     */
    describeDataset(connectorId: string, datasetId: string): Observable<DatasetDescription> {
        console.log("[DatasetCatalogsServices] describeDataset");
        var params: any = {
            connectorId: connectorId,
            datasetId: datasetId
        };
        return this.httpMgr.doGet(this.serviceName, "describeDataset", params).map(
            resp => {
                let titles: ARTLiteral[] = [];
                resp.titles.forEach((t: string) => {
                    titles.push(ResourceUtils.parseLiteral(t));
                });
                let descriptions: ARTLiteral[] = [];
                resp.descriptions.forEach((d: string) => {
                    descriptions.push(ResourceUtils.parseLiteral(d));
                });
                let description: DatasetDescription = {
                    dataDump: resp.dataDump,
                    datasetPage: resp.datasetPage,
                    descriptions: descriptions,
                    facets: resp.facets,
                    id: resp.id,
                    lexicalizationModel: resp.lexicalizationModel,
                    model: resp.model,
                    ontologyIRI: (resp.ontologyIRI != null) ? ResourceUtils.parseURI(resp.ontologyIRI) : null,
                    sparqlEndpoint: resp.sparqlEndpoint,
                    titles: titles,
                    uriPrefix: resp.uriPrefix
                };
                return description;
            }
        );
    }
        
}