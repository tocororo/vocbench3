import { Injectable } from '@angular/core';
import { HttpManager } from './HttpManager';

@Injectable()
export class StMetadataRegistry extends HttpManager {

    protected artifactId: string = "st-metadata-registry-services";

}