import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {ConverterContractDescription, SignatureDescription, ParameterDescription} from "../models/Coda";

@Injectable()
export class CODAServices {

    private serviceName = "CODA";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns a list of ConverterContractDescription
     */
    listConverterContracts(): Observable<ConverterContractDescription[]> {
        console.log("[CODAServices] listConverterContracts");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConverterContracts", params, true).map(
            stResp => {
                let converters: ConverterContractDescription[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    let converterObj = stResp[i];

                    let signatures: SignatureDescription[] = [];
                    let signaturesArrayObj = converterObj.signatures;
                    for (var j = 0; j < signaturesArrayObj.length; j++) {
                        let signatureObj = signaturesArrayObj[j];

                        let parameters: ParameterDescription[] = [];
                        let parametersArrayObj = signatureObj.params;
                        for (var k = 0; k < parametersArrayObj.length; k++) {
                            let paramObj = parametersArrayObj[k];
                            parameters.push(new ParameterDescription(paramObj.name, paramObj.type, paramObj.description));
                        }

                        signatures.push(new SignatureDescription(signatureObj.returnType, signatureObj.featurePathRequiredLevel, parameters));
                    }
                    
                    let converter: ConverterContractDescription = new ConverterContractDescription(
                        converterObj.uri, converterObj.name, converterObj.description,
                        converterObj.rdfCapability, converterObj.datatypes, signatures);

                    converters.push(converter);
                }
                //sort by name
                converters.sort(
                    function(a: ConverterContractDescription, b: ConverterContractDescription) {
                        if (a.getName() < b.getName()) return -1;
                        if (a.getName() > b.getName()) return 1;
                        return 0;
                    }
                );
                return converters;
            }
        );
    }
    
}