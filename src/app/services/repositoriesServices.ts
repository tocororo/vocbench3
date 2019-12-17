import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { Repository, RemoteRepositorySummary, ExceptionDAO } from "../models/Project";

@Injectable()
export class RepositoriesServices {

    private serviceName = "Repositories";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Updates the value of a triple replacing the old value with the new one
     */
    getRemoteRepositories(serverURL: string, username?: string, password?: string): Observable<Repository[]> {
        var params: any = {
            serverURL: serverURL
        };
        if (username != null && password != null) {
            params.username = username;
            params.password = password;
        }
        return this.httpMgr.doPost(this.serviceName, "getRemoteRepositories", params).map(
            stResp => {
                var repositories: Repository[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    let repo: Repository = {
                        id: stResp[i].id,
                        location: stResp[i].location,
                        description: stResp[i].description,
                        readable: stResp[i].readable,
                        writable: stResp[i].writable
                    };
                    repositories.push(repo);
                }
                return repositories;
            }
        );
    }

    /**
     * Delete a list of remote repositories.
     * Returns a list of ExceptionDAO. This list has the same lenght of the param remoteRepositories and contains null if the repository
     * (at the corresponding position) has been deleted successfully, or the exception description if it failed
     * 
     * @param remoteRepositories 
     */
    deleteRemoteRepositories(remoteRepositories: RemoteRepositorySummary[]): Observable<ExceptionDAO[]> {
        let params: any = {
            remoteRepositories: JSON.stringify(remoteRepositories)
        }
        return this.httpMgr.doPost(this.serviceName, "deleteRemoteRepositories", params).map(
            stResp => {
                let exceptions: ExceptionDAO[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    let ex: ExceptionDAO;
                    if (stResp[i] != null) {
                        ex = {
                            message: stResp[i].message,
                            type: stResp[i].type,
                            stacktrace: stResp[i].stacktrace
                        }
                    }
                    exceptions.push(ex); //in case the repository at position i has been
                }
                return exceptions;
            }
        );
    }


}