import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource } from '../models/ARTResources';
import { RDFFormat } from '../models/RDFFormat';
import { HttpManager, STRequestParams } from "../utils/HttpManager";

@Injectable()
export class ShaclServices {

    private serviceName = "SHACL";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Loads SHACL shapes into the SHACL Shape Graph associated with the contextual project. Existing shapes
	 * are deleted by default, but this behavior can be overridden.
     * @param shapesFile 
     * @param fileFormat 
     * @param clearExisting 
     */
    loadShapes(shapesFile: File, fileFormat: RDFFormat, clearExisting?: boolean): Observable<void> {
        let params: STRequestParams = {
            shapesFile: shapesFile,
            fileFormat: fileFormat.name,
            clearExisting: clearExisting
        };
        return this.httpMgr.uploadFile(this.serviceName, "loadShapes", params);
    }

    /**
     * Exports the shapes currently stored in the SHACL Shape Graph associated with the contextual project.
	 * The output format is by default pretty printed TURTLE, but this behavior can be overridden.
     * @param rdfFormat 
     * @param exporterConfiguration 
     */
    exportShapes(rdfFormat?: RDFFormat, exporterConfiguration?: any): Observable<Blob> {
        let params: STRequestParams = {
            rdfFormat: rdfFormat ? rdfFormat.name : null,
            exporterConfiguration: JSON.stringify(exporterConfiguration)
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportShapes", params);
    }

    /**
     * Delete existing shapes. This operation clears the SHACL Shape Graph associated with the contextual
	 * project.
     */
    clearShapes(): Observable<void> {
        let params: STRequestParams = {};
        return this.httpMgr.doPost(this.serviceName, "clearShapes", params);
    }


    /**
     * 
     * @param classIri 
     * @param shapesFile 
     * @param fileFormat 
     * @param targetShape 
     */
    extractCFfromShapeFile(classIri: ARTURIResource, shapesFile: File, fileFormat?: RDFFormat, targetShape?: ARTURIResource) {
        let params: STRequestParams = {
            // classIri: classIri,
            classIri: classIri.toNT(),
            shapesFile: shapesFile,
            fileFormat: fileFormat != null ? fileFormat.name : null,
            targetShape: targetShape
        };
        return this.httpMgr.uploadFile(this.serviceName, "extractCFfromShapeFile", params);
    }

    /**
     * 
     * @param classIri 
     * @param targetShape 
     */
    extractCFfromShapesGraph(classIri: ARTURIResource, targetShape?: ARTURIResource) {
        let params: STRequestParams = {
            classIri: classIri,
            targetShape: targetShape
        };
        return this.httpMgr.doPost(this.serviceName, "extractCFfromShapesGraph", params);
    }

    /**
     * 
     * @param classIri 
     * @param shape 
     * @param fileFormat 
     * @param targetShape 
     */
    extractCFfromShapeURL(classIri: ARTURIResource, shape: string, fileFormat?: RDFFormat, targetShape?: ARTURIResource) {
        let params: STRequestParams = {
            classIri: classIri,
            shape: shape,
            fileFormat: fileFormat != null ? fileFormat.name : null,
            targetShape: targetShape
        };
        return this.httpMgr.doPost(this.serviceName, "extractCFfromShapeURL", params);
    }

}