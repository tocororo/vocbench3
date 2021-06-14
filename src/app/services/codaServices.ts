import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConverterContractDescription, ParameterDescription, PearlValidationResult, SignatureDescription } from "../models/Coda";
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class CODAServices {

	private serviceName = "CODA";

	constructor(private httpMgr: HttpManager) { }

	/**
	 * Returns a list of ConverterContractDescription
	 */
	listConverterContracts(): Observable<ConverterContractDescription[]> {
		let params: any = {};
		return this.httpMgr.doGet(this.serviceName, "listConverterContracts", params).pipe(
			map(stResp => {
				let converters: ConverterContractDescription[] = [];
				for (let i = 0; i < stResp.length; i++) {
					let converterObj = stResp[i];
					converters.push(ConverterContractDescription.parse(converterObj));
				}
				//sort by name
				converters.sort(
					function (a: ConverterContractDescription, b: ConverterContractDescription) {
						if (a.getName() < b.getName()) return -1;
						if (a.getName() > b.getName()) return 1;
						return 0;
					}
				);
				return converters;
			})
		);
	}

	validatePearl(pearlCode: string, rulesShouldExists?: boolean): Observable<PearlValidationResult> {
		let params: any = {
			pearlCode: pearlCode,
			rulesShouldExists: rulesShouldExists
		};
		return this.httpMgr.doPost(this.serviceName, "validatePearl", params);
	}

	isRemoteProvisioningEnabled() {
		let params = {};
		return this.httpMgr.doGet(this.serviceName, "isRemoteProvisioningEnabled", params);
	}

	setRemoteProvisioningEnabled(enable: boolean) {
		let params = {
			enable: enable
		};
		return this.httpMgr.doPost(this.serviceName, "setRemoteProvisioningEnabled", params);
	}

}