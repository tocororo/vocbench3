import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { RepositoryAccess, BackendTypesEnum } from "../models/Project";
import { VersionInfo } from "../models/History";
import { PluginSpecification } from "../models/Plugins";

@Injectable()
export class VersionsServices {

    private serviceName = "Versions";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Gets the available versions for the current project
     */
    getVersions(): Observable<VersionInfo[]> {
        console.log("[VersionsServices] getVersions");
        var params: any = {
            setRepositoryStatus: true
        };
        return this.httpMgr.doGet(this.serviceName, "getVersions", params).map(
            stResp => {
                var versions: VersionInfo[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    let v: VersionInfo = new VersionInfo(stResp[i].versionId, stResp[i].repositoryId, new Date(stResp[i].dateTime), stResp[i].repositoryStatus);
                    versions.push(v);
                }
                //sort by date
                versions.sort(
                    function (v1: VersionInfo, v2: VersionInfo) {
                        if (v1.dateTime > v2.dateTime) return -1;
                        if (v1.dateTime < v2.dateTime) return 1;
                        return 0;
                    }
                );

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
     * @param backendType 
     */
    createVersionDump(versionId: string, repositoryAccess?: RepositoryAccess, repositoryId?: string,
        repoConfigurerSpecification?: PluginSpecification, backendType?: BackendTypesEnum) {

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
            params.repoConfigurerSpecification = JSON.stringify(repoConfigurerSpecification);
        }
        if (backendType != null) {
            params.backendType = backendType;
        }
        return this.httpMgr.doPost(this.serviceName, "createVersionDump", params);
    }

    /**
     * 
     * @param versionId 
     */
    closeVersion(versionId: string) {
        console.log("[VersionsServices] closeVersion");
        var params: any = {
            versionId: versionId
        };
        return this.httpMgr.doPost(this.serviceName, "closeVersion", params);
    }


}