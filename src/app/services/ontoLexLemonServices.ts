import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from '../utils/Deserializer';
import { VBEventHandler } from '../utils/VBEventHandler';
import { ARTURIResource, ARTLiteral, ResAttribute, ARTResource } from "../models/ARTResources";
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

        return this.httpMgr.doPost(this.serviceName, "createLexicon", params).map(
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
        return this.httpMgr.doGet(this.serviceName, "getLexicons", params).map(
            stResp => {
                var lexicons = Deserializer.createURIArray(stResp);
                return lexicons;
            }
        );
    }

    /**
     * Deletes a lexicon.
     * @param lexicon 
     */
    deleteLexicon(lexicon: ARTURIResource) {
        console.log("[OntoLexLemonServices] deleteLexicon");
        var params: any = {
            lexicon: lexicon
        };
        return this.httpMgr.doPost(this.serviceName, "deleteLexicon", params).map(
            stResp => {
                this.eventHandler.lexiconDeletedEvent.emit(lexicon);
                return stResp;
            }
        );
    }

    /**
     * Creates a new ontolex:LexicalEntry.
     * @param canonicalForm 
     * @param lexicon 
     * @param newLexicalEntry 
     * @param lexicalEntryCls
     * @param customFormValue 
     */
    createLexicalEntry(canonicalForm: ARTLiteral, lexicon: ARTURIResource, newLexicalEntry?: ARTURIResource, lexicalEntryCls?: ARTURIResource,
        customFormValue?: CustomFormValue): Observable<ARTURIResource> {
        
        console.log("[OntoLexLemonServices] createLexicalEntry");
        var params: any = {
            canonicalForm: canonicalForm,
            lexicon: lexicon
        };
        if (newLexicalEntry != null) {
            params.newLexicalEntry = newLexicalEntry;
        }
        if (lexicalEntryCls != null) {
            params.lexicalEntryCls = lexicalEntryCls;
        }
        if (customFormValue != null) {
            params.customFormValue = customFormValue;
        }
        return this.httpMgr.doPost(this.serviceName, "createLexicalEntry", params).map(
            stResp => {
                return Deserializer.createURI(stResp);
            }
        ).flatMap(
            entry => {
                return this.resourceService.getResourceDescription(entry).map(
                    resource => {
                        resource.setAdditionalProperty(ResAttribute.NEW, true);
                        this.eventHandler.lexicalEntryCreatedEvent.emit({ entry: (<ARTURIResource>resource), lexicon: lexicon });
                        return <ARTURIResource>resource;
                    }
                );
            }
        );
    }

    /**
     * Returns the entries in a given lexicon that starts with the supplied character.
     * @param index 
     * @param lexicon 
     */
    getLexicalEntriesByAlphabeticIndex(index: string, lexicon: ARTURIResource): Observable<ARTURIResource[]> {
        console.log("[OntoLexLemonServices] getLexicalEntriesByAlphabeticIndex");
        var params: any = {
            index: index,
            lexicon: lexicon
        };
        return this.httpMgr.doGet(this.serviceName, "getLexicalEntriesByAlphabeticIndex", params).map(
            stResp => {
                var lexicons = Deserializer.createURIArray(stResp);
                return lexicons;
            }
        );
    }

    /**
     * Sets the canonical form of a given lexical entry.
     * @param lexicalEntry 
     * @param writtenRep 
     * @param newForm 
     * @param customFormValue 
     */
    setCanonicalForm(lexicalEntry: ARTURIResource, writtenRep: ARTLiteral, newForm?: ARTURIResource, customFormValue?: CustomFormValue) {
        console.log("[OntoLexLemonServices] setCanonicalForm");
        var params: any = {
            lexicalEntry: lexicalEntry,
            writtenRep: writtenRep
        };
        if (newForm != null) {
            params.newForm = newForm;
        }
        if (customFormValue != null) {
            params.customFormValue = customFormValue;
        }
        return this.httpMgr.doPost(this.serviceName, "setCanonicalForm", params);
    }

    /**
     * Adds an other form of a given lexical entry.
     * @param lexicalEntry 
     * @param writtenRep 
     * @param newForm 
     * @param customFormValue 
     */
    addOtherForm(lexicalEntry: ARTURIResource, writtenRep: ARTLiteral, newForm: ARTURIResource, customFormValue?: CustomFormValue) {
        console.log("[OntoLexLemonServices] addOtherForm");
        var params: any = {
            lexicalEntry: lexicalEntry,
            writtenRep: writtenRep
        };
        if (newForm != null) {
            params.newForm = newForm;
        }
        if (customFormValue != null) {
            params.customFormValue = customFormValue;
        }
        return this.httpMgr.doPost(this.serviceName, "addOtherForm", params);
    }
    
    /**
     * Removes a form of a lexical entry, and deletes it.
     * @param lexicalEntry 
     * @param property 
     * @param form 
     */
    removeForm(lexicalEntry: ARTResource, property: ARTURIResource, form: ARTResource) {
        console.log("[OntoLexLemonServices] removeForm");
        var params: any = {
            lexicalEntry: lexicalEntry,
            property: property,
            form: form
        };
        return this.httpMgr.doPost(this.serviceName, "removeForm", params);
    }

    /**
     * Deletes a lexical entry.
     * @param lexicalEntry 
     */
    deleteLexicalEntry(lexicalEntry: ARTURIResource) {
        console.log("[OntoLexLemonServices] deleteLexicon");
        var params: any = {
            lexicalEntry: lexicalEntry
        };
        return this.httpMgr.doPost(this.serviceName, "deleteLexicalEntry", params);
    }

}
