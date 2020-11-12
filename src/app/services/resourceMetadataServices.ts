import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RDFResourceRolesEnum } from '../models/ARTResources';
import { Reference } from '../models/Configuration';
import { ResourceMetadataAssociation, ResourceMetadataPattern, ResourceMetadataPatternDefinition } from '../models/ResourceMetadata';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class ResourceMetadataServices {

    private serviceName = "ResourceMetadata";

    constructor(private httpMgr: HttpManager) { }

    /* ==== Associations ==== */

    /**
     * 
     */
    listAssociations(): Observable<ResourceMetadataAssociation[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "listAssociations", params).pipe(
            map(stResp => {
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
            })
        );
    }

    /**
     * 
     * @param role 
     * @param patternReference 
     */
    addAssociation(role: RDFResourceRolesEnum, patternReference: string) {
        let params = {
            role: role,
            patternReference: patternReference
        }
        return this.httpMgr.doPost(this.serviceName, "addAssociation", params);
    }

    /**
     * 
     * @param reference 
     */
    deleteAssociation(reference: string) {
        let params = {
            reference: reference,
        }
        return this.httpMgr.doPost(this.serviceName, "deleteAssociation", params);
    }

    /* ==== Patterns ==== */

    /**
     * 
     */
    getPatternIdentifiers(): Observable<string[]> {
        let params = {}
        return this.httpMgr.doGet(this.serviceName, "getPatternIdentifiers", params).pipe(
            map(refs => {
                return refs.sort();
            })
        );
    }

    /**
     * 
     */
    getFactoryPatternIdentifiers(): Observable<string[]> {
        let params = {}
        return this.httpMgr.doGet(this.serviceName, "getFactoryPatternIdentifiers", params).pipe(
            map(refs => {
                return refs.sort();
            })
        );
    }

    /**
     * 
     */
    getLibraryPatternIdentifiers(): Observable<string[]> {
        let params = {}
        return this.httpMgr.doGet(this.serviceName, "getLibraryPatternIdentifiers", params).pipe(
            map(refs => {
                return refs.sort();
            })
        );
    }

    /**
     * 
     * @param reference 
     */
    getPattern(reference: string): Observable<ResourceMetadataPattern> {
        let params = {
            reference: reference
        }
        return this.httpMgr.doGet(this.serviceName, "getPattern", params).pipe(
            map(stResp => {
                return <ResourceMetadataPattern>ResourceMetadataPattern.parse(stResp);
            })
        );
    }

    /**
     * 
     * @param reference 
     * @param definition 
     */
    createPattern(reference: string, definition: ResourceMetadataPatternDefinition): Observable<void> {
        let params = {
            reference: reference,
            definition: JSON.stringify(definition)
        }
        return this.httpMgr.doPost(this.serviceName, "createPattern", params);
	}

    /**
     * 
     * @param reference 
     * @param definition 
     */
	updatePattern(reference: string, definition: ResourceMetadataPatternDefinition): Observable<void> {
        let params = {
            reference: reference,
            definition: JSON.stringify(definition)
        }
        return this.httpMgr.doPost(this.serviceName, "updatePattern", params);
	}

    /**
     * 
     * @param reference 
     */
	deletePattern(reference: string): Observable<void> {
        let params = {
            reference: reference,
        }
        return this.httpMgr.doPost(this.serviceName, "deletePattern", params);
    }
    
    /**
     * 
     * @param reference 
     * @param name 
     */
    importPatternFromLibrary(reference: string, name: string): Observable<void> {
        let params = {
            reference: reference,
            name: name
        }
        return this.httpMgr.doPost(this.serviceName, "importPatternFromLibrary", params);

    }

    /**
     * 
     * @param reference 
     * @param name 
     */
    storePatternInLibrary(reference: string, name: string): Observable<void> {
        let params = {
            reference: reference,
            name: name
        }
        return this.httpMgr.doPost(this.serviceName, "storePatternInLibrary", params);
    }

    /**
     * 
     * @param reference 
     * @param name 
     */
    clonePattern(reference: string, name: string) {
        let params = {
            reference: reference,
            name: name
        }
        return this.httpMgr.doPost(this.serviceName, "clonePattern", params);
    }

    /**
     * 
     * @param reference 
     */
    exportPattern(reference: string): Observable<Blob> {
        var params = {
            reference: reference
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportPattern", params);
    }

    /**
     * 
     * @param inputFile 
     * @param name 
     */
    importPattern(inputFile: File, name: string): Observable<void> {
        var data: any = {
            inputFile: inputFile,
            name: name
        };
        return this.httpMgr.uploadFile(this.serviceName, "importPattern", data);
    }

}