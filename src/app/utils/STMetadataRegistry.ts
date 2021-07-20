import { Injectable } from '@angular/core';
import { HttpManager } from './HttpManager';

@Injectable()
export class StMetadataRegistry extends HttpManager {

    static readonly artifactId: string = "st-metadata-registry-services";

    protected getRequestBaseUrl(service: string, request: string): string {
        return this.serverhost + "/" + StMetadataRegistry.serverpath + "/" + StMetadataRegistry.groupId + "/" + StMetadataRegistry.artifactId + "/" + service + "/" + request + "?";
    }

}