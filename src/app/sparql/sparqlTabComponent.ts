import { Component } from "@angular/core";
import { Observable } from "rxjs/observable";
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationsServices } from "../services/configurationsServices";
import { ExportServices } from "../services/exportServices";
import { SearchServices } from "../services/searchServices";
import { SparqlServices } from "../services/sparqlServices";
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { SharedModalServices } from '../widget/modal/sharedModal/sharedModalServices';
import { AbstractSparqlTabComponent } from "./abstractSparqlTabComponent";
import { LoadConfigurationModalReturnData } from "../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { ConfigurationComponents } from "../models/Configuration";

@Component({
    selector: "sparql-tab",
    templateUrl: "./sparqlTabComponent.html"
})
export class SparqlTabComponent extends AbstractSparqlTabComponent {

    constructor(sparqlService: SparqlServices, exportService: ExportServices, configurationsService: ConfigurationsServices,
        searchService: SearchServices, basicModals: BasicModalServices, sharedModals: SharedModalServices, modal: Modal) {
        super(sparqlService, exportService, configurationsService, searchService, basicModals, sharedModals, modal);
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
                this.storedQueryReference = data.relativeReference;
                this.updateName.emit(data.relativeReference.substring(data.relativeReference.indexOf(":")+1));
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
                this.savedStatus.emit(true);
            },
            () => {}
        )
    }


}
