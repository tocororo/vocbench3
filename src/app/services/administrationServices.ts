import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class AdministrationServices {

    private serviceName = "administration";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

}