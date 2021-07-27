import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DirectoryEntryInfo } from '../models/Storage';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class StorageServices {

    private serviceName = "Storage";

    constructor(private httpMgr: HttpManager) { }

    
    list(dir: string): Observable<DirectoryEntryInfo[]> {
        let params = {
            dir: dir,
        }
        return this.httpMgr.doGet(this.serviceName, "list", params);
    }

    createDirectory(dir: string): Observable<void> {
        let params = {
            dir: dir,
        }
        return this.httpMgr.doPost(this.serviceName, "createDirectory", params);
    }

    deleteDirectory(dir: string): Observable<void> {
        let params = {
            dir: dir,
        }
        return this.httpMgr.doPost(this.serviceName, "deleteDirectory", params);
    }
    
    createFile(data: File, path: string, overwrite?: boolean): Observable<void> {
        let params = {
            data: data,
            path: path,
            overwrite: overwrite,
        }
        return this.httpMgr.uploadFile(this.serviceName, "createFile", params);
    }
    
    deleteFile(path: string): Observable<void> {
        let params = {
            path: path,
        }
        return this.httpMgr.doPost(this.serviceName, "deleteFile", params);
    }

    getFile(path: string): Observable<Blob> {
        let params = {
            path: path,
        }
        return this.httpMgr.downloadFile(this.serviceName, "getFile", params);
    }


}