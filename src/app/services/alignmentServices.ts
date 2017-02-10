import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {ARTResource, ARTURIResource, RDFResourceRolesEnum} from "../models/ARTResources";
import {Deserializer} from "../utils/Deserializer";
import {AlignmentCell} from "../alignment/alignmentValidation/AlignmentCell";

@Injectable()
export class AlignmentServices {

    private serviceName = "Alignment";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }
    
    //======= Alignment creation (in Res. view) services ===========

    /**
     * Returns the available alignment properties depending on the project and resource type (property,
	 * or concept, or class,...).
	 * @param resource resource to align
	 * @param allMappingProps if false returns just the mapping properties available for the current
	 * model type; if true returns all the mapping properties independently from the model type
	 * @return a collection of properties
     */
    getMappingRelations(resource: ARTResource, allMappingProps: boolean) {
        console.log("[AlignmentServices] getMappingRelations");
        var params: any = {
            resource: resource.getNominalValue(),
            allMappingProps: allMappingProps
        };
        return this.httpMgr.doGet(this.serviceName, "getMappingRelations", params, this.oldTypeService).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
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
            sourceResource: sourceResource.getNominalValue(),
            predicate: predicate.getURI(),
            targetResource: targetResource.getNominalValue()
        };
        return this.httpMgr.doGet(this.serviceName, "addAlignment", params, this.oldTypeService);
    }
    
    //======= Alignment Validation services ===========
    
    /**
     * Loads the alignment file
     * @param file alignment file to upload
     * @return return an object with "onto1" and "onto2", namely the baseURI of the two aligned ontologies
     */
    loadAlignment(file: File) {
        console.log("[AlignmentServices] loadAlignment");
        var data = {
            inputFile: file
        }
        return this.httpMgr.uploadFile(this.serviceName, "loadAlignment", data, this.oldTypeService).map(
            stResp => {
                var onto1 = stResp.getElementsByTagName("onto1")[0].getElementsByTagName("Ontology")[0].textContent;
                var onto2 = stResp.getElementsByTagName("onto2")[0].getElementsByTagName("Ontology")[0].textContent;
                return { onto1: onto1, onto2: onto2 };
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
    listCells(pageIdx?: number, range?: number) {
        console.log("[AlignmentServices] listCells");
        var params: any = {};
        if (pageIdx != undefined && range != undefined) {
            params.pageIdx = pageIdx,
            params.range = range
        }
        return this.httpMgr.doGet(this.serviceName, "listCells", params, this.oldTypeService).map(
            stResp => {
                var alignmentMap: any = {};
                var mapElem: Element = stResp.getElementsByTagName("map")[0];
                var page: number = +(mapElem.getAttribute("page"));
                var totPage: number = +(mapElem.getAttribute("totPage"));
                var cells: Array<AlignmentCell> = [];
                var cellElemColl: Array<Element> = stResp.getElementsByTagName("cell");
                for (var i = 0; i < cellElemColl.length; i++) {
                    cells.push(this.parseAlignmentCell(cellElemColl[i]));
                }
                alignmentMap.page = page;
                alignmentMap.totPage = totPage;
                alignmentMap.cells = cells;
                return alignmentMap;
            }
        );
    }
    
    /**
     * Accepts an alignment and return the cell with the result of the action.
     * @param entity1 uri of the source entity of the alignment
     * @param entity2 uri of the target entity of the alignment
     * @param relation the relation of the alignment
     * @return a cell resulting from the action
     */
    acceptAlignment(entity1: string, entity2: string, relation: string) {
	    console.log("[AlignmentServices] acceptAlignment");
	    var params = {
            entity1: entity1,
            entity2: entity2,
            relation: relation
        };
	    return this.httpMgr.doGet(this.serviceName, "acceptAlignment", params, this.oldTypeService).map(
            stResp => {
                return this.parseAlignmentCell(stResp.getElementsByTagName("cell")[0]);
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
        return this.httpMgr.doGet(this.serviceName, "acceptAllAlignment", params, this.oldTypeService).map(
            stResp => {
                var cells: Array<AlignmentCell> = [];
                var cellElemColl: Array<Element> = stResp.getElementsByTagName("cell");
                for (var i = 0; i < cellElemColl.length; i++) {
                    cells.push(this.parseAlignmentCell(cellElemColl[i]));
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
        return this.httpMgr.doGet(this.serviceName, "acceptAllAbove", params, this.oldTypeService).map(
            stResp => {
                var cells: Array<AlignmentCell> = [];
                var cellElemColl: Array<Element> = stResp.getElementsByTagName("cell");
                for (var i = 0; i < cellElemColl.length; i++) {
                    cells.push(this.parseAlignmentCell(cellElemColl[i]));
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
    rejectAlignment(entity1: string, entity2: string, relation: string) {
	    console.log("[AlignmentServices] acceptAlignment");
	    var params = {
            entity1: entity1,
            entity2: entity2,
            relation: relation
        };
	    return this.httpMgr.doGet(this.serviceName, "rejectAlignment", params, this.oldTypeService).map(
            stResp => {
                return this.parseAlignmentCell(stResp.getElementsByTagName("cell")[0]);
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
        return this.httpMgr.doGet(this.serviceName, "rejectAllAlignment", params, this.oldTypeService).map(
            stResp => {
                var cells: Array<AlignmentCell> = [];
                var cellElemColl: Array<Element> = stResp.getElementsByTagName("cell");
                for (var i = 0; i < cellElemColl.length; i++) {
                    cells.push(this.parseAlignmentCell(cellElemColl[i]));
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
        return this.httpMgr.doGet(this.serviceName, "rejectAllUnder", params, this.oldTypeService).map(
            stResp => {
                var cells: Array<AlignmentCell> = [];
                var cellElemColl: Array<Element> = stResp.getElementsByTagName("cell");
                for (var i = 0; i < cellElemColl.length; i++) {
                    cells.push(this.parseAlignmentCell(cellElemColl[i]));
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
    changeRelation(entity1: string, entity2: string, relation: string) {
        console.log("[AlignmentServices] changeRelation");
        var params = {
            entity1: entity1,
            entity2: entity2,
            relation: relation
        };
        return this.httpMgr.doGet(this.serviceName, "changeRelation", params, this.oldTypeService).map(
            stResp => {
                return this.parseAlignmentCell(stResp.getElementsByTagName("cell")[0]);
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
    changeMappingProperty(entity1: string, entity2: string, mappingProperty: string) {
        console.log("[AlignmentServices] changeMappingProperty");
        var params = {
            entity1: entity1,
            entity2: entity2,
            mappingProperty: mappingProperty
        };
        return this.httpMgr.doGet(this.serviceName, "changeMappingProperty", params, this.oldTypeService).map(
            stResp => {
                return this.parseAlignmentCell(stResp.getElementsByTagName("cell")[0]);
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
        return this.httpMgr.doGet(this.serviceName, "applyValidation", params, this.oldTypeService).map(
            stResp => {
                var cells: Array<any> = [];
                var cellElemColl: Array<Element> = stResp.getElementsByTagName("cell");
                for (var i = 0; i < cellElemColl.length; i++) {
                    var c = {
                        entity1: cellElemColl[i].getAttribute("entity1"),
                        entity2: cellElemColl[i].getAttribute("entity2"),
                        property: cellElemColl[i].getAttribute("property"),
                        action: cellElemColl[i].getAttribute("action")
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
    listSuggestedProperties(entity: string, relation: string) {
	    console.log("[AlignmentServices] listSuggestedProperties");
        var params = {
            entity: entity,
            relation: relation
        };
        return this.httpMgr.doGet(this.serviceName, "listSuggestedProperties", params, this.oldTypeService).map(
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
        return this.httpMgr.downloadFile(this.serviceName, "exportAlignment", params, this.oldTypeService);
    }

    /**
     * Tells to the server that the sessione is closed and the alignment files can be deleted
     */
    closeSession(){
	    console.log("[AlignmentServices] closeSession");
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "closeSession", params, this.oldTypeService);
    }
    
    
    
    
    
    
    private parseAlignmentCell(cellElement: Element): AlignmentCell {
        let entity1: string = cellElement.getElementsByTagName("entity1")[0].textContent;
        let entity2: string = cellElement.getElementsByTagName("entity2")[0].textContent;
        let measure: number = +(cellElement.getElementsByTagName("measure")[0].textContent);
        let relation: string = cellElement.getElementsByTagName("relation")[0].textContent;
        let mappingProperty: ARTURIResource;
        let mapPropElemColl = cellElement.getElementsByTagName("mappingProperty");
        if (mapPropElemColl.length != 0) {
            mappingProperty = new ARTURIResource(
                mapPropElemColl[0].textContent,
                mapPropElemColl[0].getAttribute("show"),
                RDFResourceRolesEnum.property);
        }
        let status: string;
        let statusElemColl = cellElement.getElementsByTagName("status");
        if (statusElemColl.length != 0) {
            status = statusElemColl[0].textContent;
        }
        let comment: string;
        let commentElemColl = cellElement.getElementsByTagName("comment");
        if (commentElemColl.length != 0) {
            comment = commentElemColl[0].textContent;
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
    
    
}