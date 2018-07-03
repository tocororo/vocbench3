import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AlignmentCell } from "../alignment/alignmentValidation/AlignmentCell";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResourceUtils, SortAttribute } from "../models/ARTResources";
import { SearchMode } from '../models/Properties';
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, HttpServiceContext } from "../utils/HttpManager";

@Injectable()
export class AlignmentServices {

    private serviceName = "Alignment";

    constructor(private httpMgr: HttpManager) { }

    //======= Alignment creation (in Res. view) services ===========

    /**
     * Returns the available alignment properties depending on the project and resource type (property,
	 * or concept, or class,...).
	 * @param resource resource to align
	 * @param allMappingProps if false returns just the mapping properties available for the current resource and
	 * model type; if true returns all the mapping properties independently from the model type
	 * @return a collection of properties
     */
    getMappingProperties(resource: ARTResource, allMappingProps: boolean) {
        console.log("[AlignmentServices] getMappingProperties");
        var params: any = {
            resource: resource,
            allMappingProps: allMappingProps
        };
        return this.httpMgr.doGet(this.serviceName, "getMappingProperties", params).map(
            stResp => {
                var props: ARTURIResource[] = Deserializer.createURIArray(stResp);
                ResourceUtils.sortResources(props, SortAttribute.value);
                return props;
            }
        );
    }

    /**
     * Adds an alignment between a local sourceResource and a targetResource chosen from an external project in ST.
     * At low level, this service simply adds the triple sourceResource predicate targetResource
     * @param sourceResource the resource (local to the project) to align 
     * @param predicate the mapping predicate
     * @param targetResource the resource (of an external project) to align
     */
    addAlignment(sourceResource: ARTResource, predicate: ARTURIResource, targetResource: ARTResource) {
        console.log("[AlignmentServices] addAlignment");
        var params: any = {
            sourceResource: sourceResource,
            predicate: predicate,
            targetResource: targetResource
        };
        return this.httpMgr.doGet(this.serviceName, "addAlignment", params);
    }

    //======= Alignment Validation services ===========

    /**
     * Loads the alignment file
     * @param file alignment file to upload
     * @return return an object with "onto1" and "onto2", namely the baseURI of the two aligned ontologies
     */
    loadAlignment(file: File): Observable<{onto1: string, onto2: string, unknownRelations: string[]}> {
        console.log("[AlignmentServices] loadAlignment");
        var data = {
            inputFile: file
        }
        return this.httpMgr.uploadFile(this.serviceName, "loadAlignment", data).map(
            stResp => {
                var onto1 = stResp.onto1;
                var onto2 = stResp.onto2;
                var unknownRelations: string[] = [];
                for (var i = 0; i < stResp.unknownRelations.length; i++) {
                    unknownRelations.push(stResp.unknownRelations[i]);
                }
                return { onto1: onto1, onto2: onto2, unknownRelations: unknownRelations };
            }
        );
    }

    /**
     * Lists the alignment cells of the loaded alignment file.
     * The cells to return could be splitted in subsets of the total cells set
     * (in order to lightweight the response). In this case, a range and a pageIdx could be provided
     * (e.g. an alignment file with 100 cells can be splitted in 10 page of range 10, or 5 page of range 20...)
     * @param pageIdx index of the page.
     * @param range number of cells of each page.
     * @return returns an object containing "cells" (an array of AlignmentCell), "page" and "totPage"
     */
    listCells(pageIdx?: number, range?: number): Observable<{page: number, totPage: number, cells: AlignmentCell[]}> {
        console.log("[AlignmentServices] listCells");
        var params: any = {};
        if (pageIdx != undefined && range != undefined) {
            params.pageIdx = pageIdx,
                params.range = range
        }
        return this.httpMgr.doGet(this.serviceName, "listCells", params).map(
            stResp => {
                var page: number = stResp.page;
                var totPage: number = stResp.totPage;
                var cells: Array<AlignmentCell> = [];
                for (var i = 0; i < stResp.cells.length; i++) {
                    cells.push(this.parseAlignmentCell(stResp.cells[i]));
                }
                let alignmentMap = {
                    page: page,
                    totPage: totPage,
                    cells: cells
                };
                return alignmentMap;
            }
        );
    }

    /**
     * Accepts an alignment and return the cell with the result of the action.
     * @param entity1 uri of the source entity of the alignment
     * @param entity2 uri of the target entity of the alignment
     * @param relation the relation of the alignment
     * @param forcedProperty the property to use in the mapping
     * @param setAsDefault if true, set the given property as default for the relation
     * @return a cell resulting from the action
     */
    acceptAlignment(entity1: ARTURIResource, entity2: ARTURIResource, relation: string, forcedProperty?: ARTURIResource, setAsDefault?: boolean) {
        console.log("[AlignmentServices] acceptAlignment");
        var params: any = {
            entity1: entity1,
            entity2: entity2,
            relation: relation
        };
        if (forcedProperty != null) {
            params.forcedProperty = forcedProperty;
            if (setAsDefault != null) { //this is used only if forcedProperty is passed
                params.setAsDefault = setAsDefault;
            }
        }
        return this.httpMgr.doGet(this.serviceName, "acceptAlignment", params).map(
            stResp => {
                return this.parseAlignmentCell(stResp);
            }
        );
    }

    /**
     * Accepts all the alignment and return the cells with the result of the action.
     * @return all cells resulting from the action
     */
    acceptAllAlignment() {
        console.log("[AlignmentServices] acceptAllAlignment");
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "acceptAllAlignment", params).map(
            stResp => {
                var cells: Array<AlignmentCell> = [];
                for (var i = 0; i < stResp.length; i++) {
                    cells.push(this.parseAlignmentCell(stResp[i]));
                }
                return cells;
            }
        );
    }

    /**
     * Accepts all the alignment with measure above the given threshold and return the cells with the result of the action.
     * @param threshold
     * @return all cells resulting from the action
     */
    acceptAllAbove(threshold: number) {
        console.log("[AlignmentServices] acceptAllAbove");
        var params = {
            threshold: threshold
        };
        return this.httpMgr.doGet(this.serviceName, "acceptAllAbove", params).map(
            stResp => {
                var cells: Array<AlignmentCell> = [];
                for (var i = 0; i < stResp.length; i++) {
                    cells.push(this.parseAlignmentCell(stResp[i]));
                }
                return cells;
            }
        );
    }

    /**
     * Rejects an alignment and return the cell with the result of the action.
     * @param entity1 uri of the source entity of the alignment
     * @param entity2 uri of the target entity of the alignment
     * @param relation the relation of the alignment
     * @return a cell resulting from the action
     */
    rejectAlignment(entity1: ARTURIResource, entity2: ARTURIResource, relation: string) {
        console.log("[AlignmentServices] acceptAlignment");
        var params = {
            entity1: entity1,
            entity2: entity2,
            relation: relation
        };
        return this.httpMgr.doGet(this.serviceName, "rejectAlignment", params).map(
            stResp => {
                return this.parseAlignmentCell(stResp);
            }
        );
    }

    /**
     * Rejects all the alignment and return the cells with the result of the action.
     * @return all cells resulting from the action
     */
    rejectAllAlignment() {
        console.log("[AlignmentServices] rejectAllAlignment");
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "rejectAllAlignment", params).map(
            stResp => {
                var cells: Array<AlignmentCell> = [];
                for (var i = 0; i < stResp.length; i++) {
                    cells.push(this.parseAlignmentCell(stResp[i]));
                }
                return cells;
            }
        );
    }

    /**
     * Rejects all the alignment with measure under the given threshold and return the cells with the result of the action.
     * @param threshold
     * @return all cells resulting from the action
     */
    rejectAllUnder(threshold: number) {
        console.log("[AlignmentServices] rejectAllUnder");
        var params = {
            threshold: threshold
        };
        return this.httpMgr.doGet(this.serviceName, "rejectAllUnder", params).map(
            stResp => {
                var cells: Array<AlignmentCell> = [];
                for (var i = 0; i < stResp.length; i++) {
                    cells.push(this.parseAlignmentCell(stResp[i]));
                }
                return cells;
            }
        );
    }

    /**
     * Changes the relation of a alignment
     * @param entity1 uri of the source entity of the alignment
     * @param entity2 uri of the target entity of the alignment
     * @param relation the new relation of the alignment
     * @return a cell resulting from the action 
     */
    changeRelation(entity1: ARTURIResource, entity2: ARTURIResource, relation: string) {
        console.log("[AlignmentServices] changeRelation");
        var params = {
            entity1: entity1,
            entity2: entity2,
            relation: relation
        };
        return this.httpMgr.doGet(this.serviceName, "changeRelation", params).map(
            stResp => {
                return this.parseAlignmentCell(stResp);
            }
        );
    }

    /**
     * Changes the mapping property of a alignment
     * @param entity1 uri of the source entity of the alignment
     * @param entity2 uri of the target entity of the alignment
     * @param mappingProperty the new mappingProperty of the alignment
     * @return a cell resulting from the action
     */
    changeMappingProperty(entity1: ARTURIResource, entity2: ARTURIResource, mappingProperty: string) {
        console.log("[AlignmentServices] changeMappingProperty");
        var params = {
            entity1: entity1,
            entity2: entity2,
            mappingProperty: mappingProperty
        };
        return this.httpMgr.doGet(this.serviceName, "changeMappingProperty", params).map(
            stResp => {
                return this.parseAlignmentCell(stResp);
            }
        );
    }

    /**
     * Apply the alignments to the model. Add the triples related to the accepted alignments and
     * eventually removes the rejected alignments
     * @param deleteRejected tells whether the rejected alignments should be deleted 
     * @return returns a collection of objects (with entity1, entity2, property and action)
     * representing a report of the changes.
     */
    applyValidation(deleteRejected: boolean) {
        console.log("[AlignmentServices] applyValidation");
        var params = {
            deleteRejected: deleteRejected
        };
        return this.httpMgr.doGet(this.serviceName, "applyValidation", params).map(
            stResp => {
                var cells: Array<any> = [];
                for (var i = 0; i < stResp.length; i++) {
                    var c = {
                        entity1: stResp[i].entity1,
                        entity2: stResp[i].entity2,
                        property: stResp[i].property,
                        action: stResp[i].action
                    }
                    cells.push(c);
                }
                return cells;
            }
        );
    }

    /**
     * Returns a list of mapping properties suggested for the given entity and the alignment relation
     * @param entity the source entity of the alignment
     * @param relation the relation of the alignment cell
     * @return collection of ARTURIResource representing suggested mapping property
     */
    getSuggestedProperties(entity: ARTURIResource, relation: string) {
        console.log("[AlignmentServices] getSuggestedProperties");
        var params = {
            entity: entity,
            relation: relation
        };
        return this.httpMgr.doGet(this.serviceName, "getSuggestedProperties", params).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Exports the alignment at the current status.
     */
    exportAlignment() {
        console.log("[AlignmentServices] exportAlignment");
        var params = {};
        return this.httpMgr.downloadFile(this.serviceName, "exportAlignment", params);
    }

    /**
     * Tells to the server that the sessione is closed and the alignment files can be deleted
     */
    closeSession() {
        console.log("[AlignmentServices] closeSession");
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "closeSession", params).map(
            stResp => {
                HttpServiceContext.removeSessionToken();
                return stResp;
            }
        );
    }


    private parseAlignmentCell(cellNode: any): AlignmentCell {
        let entity1: ARTURIResource = new ARTURIResource(cellNode.entity1);
        let entity2: ARTURIResource = new ARTURIResource(cellNode.entity2);
        let measure: number = cellNode.measure;
        let relation: string = cellNode.relation;
        let mappingProperty: ARTURIResource;
        if (cellNode.mappingProperty != null) {
            mappingProperty = Deserializer.createURI(cellNode.mappingProperty);
            mappingProperty.setRole(RDFResourceRolesEnum.property);
        }
        let status: string;
        if (cellNode.status != null) {
            status = cellNode.status;
        }
        let comment: string;
        if (cellNode.comment != null) {
            comment = cellNode.comment;
        }
        let c = new AlignmentCell(entity1, entity2, measure, relation);
        if (mappingProperty != undefined) {
            c.setMappingProperty(mappingProperty)
        }
        if (status != undefined) {
            c.setStatus(status);
        }
        if (comment != undefined) {
            c.setComment(comment);
        }
        return c;
    }


    /**
     * 
     * @param inputRes 
     * @param resourcePosition local/remote:<projectName/datasetIri>
     * @param rolesArray the sole role of inputRes
     * @param langToLexModel map langForTheSearch - LexModel
     * @param searchModeList 
     */
    searchResources(inputRes: ARTURIResource, resourcePosition: string, rolesArray: RDFResourceRolesEnum[], 
        langToLexModel?: Map<string, ARTURIResource>, searchModeList?: SearchMode[]): Observable<ARTURIResource[]> {

        console.log("[AlignmentServices] searchResources");
        var params: any = {
            intputRes: inputRes,
            resourcePosition: resourcePosition,
            rolesArray: rolesArray
        };
        if (langToLexModel != null) {
            params.langToLexModel = langToLexModel;
        }
        if (searchModeList != null) {
            params.searchModeList = searchModeList;
        }
        return this.httpMgr.doGet(this.serviceName, "searchResources", params).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );

    }

}