import { Component } from "@angular/core";
import { Observable } from 'rxjs';
import { ConfigurationComponents } from "../models/Configuration";
import { SparqlServices } from "../services/sparqlServices";
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { LoadConfigurationModalReturnData } from "../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from '../widget/modal/sharedModal/sharedModalServices';
import { AbstractSparqlTabComponent } from "./abstractSparqlTabComponent";

@Component({
    selector: "sparql-tab",
    templateUrl: "./sparqlTabComponent.html"
})
export class SparqlTabComponent extends AbstractSparqlTabComponent {

    constructor(sparqlService: SparqlServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(sparqlService, basicModals, sharedModals);
    }

    evaluateQueryImpl(): Observable<any> {
        return this.sparqlService.evaluateQuery(this.query, this.inferred);
    }

    executeUpdateImpl(): Observable<any> {
        return this.sparqlService.executeUpdate(this.query, this.inferred);
    }

    //LOAD/SAVE/PARAMETERIZE QUERY

    loadConfiguration() {
        this.sharedModals.loadConfiguration("Load SPARQL query", ConfigurationComponents.SPARQL_STORE).then(
            (data: LoadConfigurationModalReturnData) => {
                let relativeRef = data.reference.relativeReference;
                this.storedQueryReference = relativeRef;
                this.updateName.emit(relativeRef.substring(relativeRef.indexOf(":")+1));
                this.setLoadedQueryConf(data.configuration);
                this.savedStatus.emit(true);
            },
            () => {}
        );
    }

    saveConfiguration() {
        let queryConfig: { [key: string]: any} = {
            sparql: this.query,
            type: this.queryMode,
            includeInferred: this.inferred
        }
        this.sharedModals.storeConfiguration("Store SPARQL query", ConfigurationComponents.SPARQL_STORE, queryConfig, this.storedQueryReference).then(
            (relativeRef: string) => {
                this.basicModals.alert("Save query", "Query saved succesfully");
                this.storedQueryReference = relativeRef;
                this.updateName.emit(relativeRef.substring(relativeRef.indexOf(":")+1));
                this.savedStatus.emit(true);
            },
            () => {}
        )
    }


}
