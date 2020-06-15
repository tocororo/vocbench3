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
        return this.httpMgr.doGet(this.serviceName, "listAssociations", params).map(
            stResp => {
                let associations: ResourceMetadataAssociation[] = []
                stResp.forEach((a: { ref: string, role: RDFResourceRolesEnum, patternRef: string }) => {
                    associations.push({
                        ref: a.ref,
                        role: a.role,
                        pattern: {
                            reference: a.patternRef,
                            name: Reference.getRelativeReferenceIdentifier(a.patternRef),
                            scope: Reference.getRelativeReferenceScope(a.patternRef)
                        }
                    })
                })
                associations.sort((a1: ResourceMetadataAssociation, a2: ResourceMetadataAssociation) => {
                    if (a1.role == a2.role) { //in case of same role, sort by pattern reference
                        return a1.pattern.reference.localeCompare(a2.pattern.reference);
                    } else {
                        return a1.role.localeCompare(a2.role);
                    }
                });
                return associations;
            }
        );
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

    getPatternIdentifiers(): Observable<string[]> {
        let params = {}
        return this.httpMgr.doGet(this.serviceName, "getPatternIdentifiers", params).map(
            refs => {
                return refs.sort();
            }
        );
    }

    getSharedPatternIdentifiers(): Observable<string[]> {
        let params = {}
        return this.httpMgr.doGet(this.serviceName, "getSharedPatternIdentifiers", params).map(
            refs => {
                return refs.sort();
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
    
    importSharedPattern(reference: string, name: string) {
        let params = {
            reference: reference,
            name: name
        }
        return this.httpMgr.doPost(this.serviceName, "importSharedPattern", params);

    }

    sharePattern(reference: string, name: string) {
        let params = {
            reference: reference,
            name: name
        }
        return this.httpMgr.doPost(this.serviceName, "sharePattern", params);
    }

}