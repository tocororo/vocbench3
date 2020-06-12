import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ResourceMetadataAssociation, ResourceMetadataPattern, ResourceMetadataPatternDefinition } from '../models/ResourceMetadata';
import { HttpManager } from "../utils/HttpManager";
import { Reference } from '../models/Configuration';
import { RDFResourceRolesEnum } from '../models/ARTResources';

@Injectable()
export class ResourceMetadataServices {

    private serviceName = "ResourceMetadata";

    constructor(private httpMgr: HttpManager) { }

    /* ==== Associations ==== */

    listAssociations(): Observable<ResourceMetadataAssociation[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "listAssociations", params);
    }

    addAssociation(role: RDFResourceRolesEnum, patternReference: string) {
        let params = {
            role: role,
            patternReference: patternReference
        }
        return this.httpMgr.doPost(this.serviceName, "addAssociation", params);
    }

    deleteAssociation(reference: string) {
        let params = {
            reference: reference,
        }
        return this.httpMgr.doPost(this.serviceName, "deleteAssociation", params);
    }

    /* ==== Patterns ==== */

    getPatternIdentifiers(): Observable<Reference[]> {
        let params = {}
        return this.httpMgr.doGet(this.serviceName, "getPatternIdentifiers", params).map(
            stResp => {
                let references: Reference[] = [];
                for (let i = 0; i < stResp.length; i++) {
                    references.push(Reference.deserialize(stResp[i]));
                }
                return references;
            }
        );
    }

    getPattern(reference: string): Observable<ResourceMetadataPattern> {
        let params = {
            reference: reference
        }
        return this.httpMgr.doGet(this.serviceName, "getPattern", params).map(
            stResp => {
                return <ResourceMetadataPattern>ResourceMetadataPattern.parse(stResp);
            }
        );
    }

    // getPatterns(): Observable<ResourceMetadataPattern[]> {
    //     let params = {}
    //     return this.httpMgr.doGet(this.serviceName, "getPatterns", params).map(
    //         stResp => {
    //             let patterns: ResourceMetadataPattern[] = [];
    //             for (let pattJson of stResp) {
    //                 patterns.push(<ResourceMetadataPattern>ResourceMetadataPattern.parse(pattJson));
    //             }
    //             return patterns;
    //         }
    //     );
    // }

    createPattern(reference: string, definition: ResourceMetadataPatternDefinition): Observable<void> {
        let params = {
            reference: reference,
            definition: JSON.stringify(definition)
        }
        return this.httpMgr.doPost(this.serviceName, "createPattern", params);
	}

	updatePattern(reference: string, definition: ResourceMetadataPatternDefinition): Observable<void> {
        let params = {
            reference: reference,
            definition: JSON.stringify(definition)
        }
        return this.httpMgr.doPost(this.serviceName, "updatePattern", params);
	}

	deletePattern(reference: string): Observable<void> {
        let params = {
            reference: reference,
        }
        return this.httpMgr.doPost(this.serviceName, "deletePattern", params);
	}

}