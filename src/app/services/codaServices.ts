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

					let signatures: SignatureDescription[] = [];
					let signaturesArrayObj = converterObj.signatures;
					for (let j = 0; j < signaturesArrayObj.length; j++) {
						let signatureObj = signaturesArrayObj[j];

						let parameters: ParameterDescription[] = [];
						let parametersArrayObj = signatureObj.params;
						for (let k = 0; k < parametersArrayObj.length; k++) {
							let paramObj = parametersArrayObj[k];
							parameters.push(new ParameterDescription(paramObj.name, paramObj.type, paramObj.description));
						}

						signatures.push(new SignatureDescription(signatureObj.returnType, signatureObj.featurePathRequiredLevel, parameters));
					}
					//sort signatures according the parameters length
					signatures.sort((s1: SignatureDescription, s2: SignatureDescription) => {
						if (s1.getParameters().length < s2.getParameters().length) return -1;
						if (s1.getParameters().length > s2.getParameters().length) return 1;
						return 0;
					});

					let converter: ConverterContractDescription = new ConverterContractDescription(
						converterObj.uri, converterObj.name, converterObj.description,
						converterObj.rdfCapability, converterObj.datatypes, signatures);

					converters.push(converter);
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