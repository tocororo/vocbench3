import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { RepositoryAccess, VersionInfo } from "../models/Project";
import { PluginSpecification } from "../models/Plugins";

@Injectable()
export class VersionsServices {

    private serviceName = "Versions";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Gets the available versions for the current project
     */
    getVersions(): Observable<VersionInfo[]> {
        console.log("[VersionsServices] getVersions");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getVersions", params, this.oldTypeService, true).map(
            stResp => {
                console.log("stResp", stResp)
                var versions: VersionInfo[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    let es = stResp[i].instant.epochSecond;
                    let d: Date = new Date(0);
                    d.setUTCSeconds(es);
                    versions.push(stResp[i]);
                }
                //TODO sort by date
                return versions;
            }
        );
    }

    /**
     * Dumps the current content of the core repository to a dedicated repository.
     * 
     * @param versionId the version identifier
     * @param repositoryAccess tells the location of the repository. If null, then the same location of the core repository is used
     * @param repositoryId tells the name of the version repository. If the repository is local, this paramater must be null
     * @param repoConfigurerSpecification 
     */
    createVersionDump(versionId: string, repositoryAccess?: RepositoryAccess, repositoryId?: string,
        repoConfigurerSpecification?: PluginSpecification) {

        console.log("[VersionsServices] createVersionDump");
        var params: any = {
            versionId: versionId
        };
        if (repositoryAccess != null) {
            params.repositoryAccess = repositoryAccess.stringify();
        }
        if (repositoryId != null) {
            params.repositoryId = repositoryId;
        }
        if (repoConfigurerSpecification != null) {
            params.repoConfigurerSpecification = repoConfigurerSpecification;
        }
        return this.httpMgr.doPost(this.serviceName, "createVersionDump", params, this.oldTypeService, true);
    }


}