import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from '../utils/Deserializer';
import { VBEventHandler } from '../utils/VBEventHandler';
import { ARTURIResource, ARTLiteral, ResAttribute } from "../models/ARTResources";
import { CustomFormValue } from '../models/CustomForms';
import { ResourcesServices } from './resourcesServices';

@Injectable()
export class OntoLexLemonServices {

    private serviceName = "OntoLexLemon";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler, private resourceService: ResourcesServices) { }

    /**
     * Creates a new lime:Lexicon for the provided language.
     * @param language 
     * @param newLexicon 
     * @param title 
     * @param customFormValue 
     */
    createLexicon(language: string, newLexicon?: ARTURIResource, title?: ARTLiteral, customFormValue?: CustomFormValue): Observable<ARTURIResource> {
        console.log("[OntoLexLemonServices] createLexicon");
        var params: any = {
            language: language
        };
        if (newLexicon != null) {
            params.newLexicon = newLexicon;
        }
        if (title != null) {
            params.title = title;
        }
        if (customFormValue != null) {
            params.customFormValue = customFormValue;
        }

        return this.httpMgr.doPost(this.serviceName, "createLexicon", params, true).map(
            stResp => {
                return Deserializer.createURI(stResp);
            }
        ).flatMap(
            lexicon => {
                return this.resourceService.getResourceDescription(lexicon).map(
                    resource => {
                        resource.setAdditionalProperty(ResAttribute.NEW, true);
                        this.eventHandler.lexiconCreatedEvent.emit(<ARTURIResource>resource);
                        return <ARTURIResource>resource;
                    }
                );
            }
        );
    }

    /**
     * Returns lexicons
     */
    getLexicons(): Observable<ARTURIResource[]> {
        console.log("[OntoLexLemonServices] getLexicons");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getLexicons", params, true).map(
            stResp => {
                var lexicons = Deserializer.createURIArray(stResp);
                return lexicons;
            }
        );
    }

    /**
     * Creates a new ontolex:LexicalEntry.
     * @param canonicalForm 
     * @param lexicon 
     * @param newLexicalEntry 
     * @param customFormValue 
     */
    createLexicalEntry(canonicalForm: ARTLiteral, lexicon: ARTURIResource, newLexicalEntry?: ARTURIResource,
        customFormValue?: CustomFormValue): Observable<ARTURIResource> {
        
        console.log("[OntoLexLemonServices] createLexicalEntry");
        var params: any = {
            canonicalForm: canonicalForm,
            lexicon: lexicon
        };
        if (newLexicalEntry != null) {
            params.newLexicalEntry = newLexicalEntry;
        }
        if (customFormValue != null) {
            params.customFormValue = customFormValue;
        }
        return this.httpMgr.doPost(this.serviceName, "createLexicalEntry", params, true).map(
            stResp => {
                return Deserializer.createURI(stResp);
            }
        ).flatMap(
            lexicon => {
                return this.resourceService.getResourceDescription(lexicon).map(
                    resource => {
                        resource.setAdditionalProperty(ResAttribute.NEW, true);
                        this.eventHandler.lexiconDeletedEvent.emit((<ARTURIResource>resource));
                        return <ARTURIResource>resource;
                    }
                );
            }
        );
    }

    //Returns the entries in a given lexicon that starts with the supplied character.
    getLexicalEntriesByAlphabeticIndex(index: string, lexicon: ARTURIResource) {
        console.log("[OntoLexLemonServices] getLexicalEntriesByAlphabeticIndex");
        var params: any = {
            index: index,
            lexicon: lexicon
        };
        return this.httpMgr.doGet(this.serviceName, "getLexicalEntriesByAlphabeticIndex", params, true).map(
            stResp => {
                var lexicons = Deserializer.createURIArray(stResp);
                return lexicons;
            }
        );
    }

}
