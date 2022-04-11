import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class XmlSchemaServices {

    private serviceName = "XMLSchema";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the dateTime formatted according to XMLSchema standard
     * @param year
     * @param month
     * @param day
     * @param hour
     * @param minute
     * @param second
     * @param offset
     * @return formatted dateTime
     */
    formatDateTime(year: number, month: number, day: number, hour: number, minute: number, second: number, offset?: string) {
        let params: any = {
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            second: second
        };
        if (offset != undefined) {
            params.offset = offset;
        }
        return this.httpMgr.doGet(this.serviceName, "formatDateTime", params).pipe(
            map(stResp => {
                return stResp["formatted"];
            })
        );
    }

    /**
     * Returns the date formatted according to XMLSchema standard
     * @param year
     * @param month
     * @param day
     * @return formatted date
     */
    formatDate(year: number, month: number, day: number) {
        let params: any = {
            year: year,
            month: month,
            day: day
        };
        return this.httpMgr.doGet(this.serviceName, "formatDate", params).pipe(
            map(stResp => {
                return stResp["formatted"];
            })
        );
    }

    /**
     * Returns the time formatted according to XMLSchema standard
     * @param hour
     * @param minute
     * @param second
     * @return formatted time
     */
    formatTime(hour: number, minute: number, second: number) {
        let params: any = {
            hour: hour,
            minute: minute,
            second: second
        };
        return this.httpMgr.doGet(this.serviceName, "formatTime", params).pipe(
            map(stResp => {
                return stResp["formatted"];
            })
        );
    }

}