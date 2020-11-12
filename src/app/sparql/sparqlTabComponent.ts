import { Component } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { GraphModalServices } from "../graph/modal/graphModalServices";
import { ConfigurationComponents } from "../models/Configuration";
import { ConfigurationsServices } from "../services/configurationsServices";
import { ExportServices } from "../services/exportServices";
import { SearchServices } from "../services/searchServices";
import { SparqlServices } from "../services/sparqlServices";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { LoadConfigurationModalReturnData } from "../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from '../widget/modal/sharedModal/sharedModalServices';
import { AbstractSparqlTabComponent } from "./abstractSparqlTabComponent";

@Component({
    selector: "sparql-tab",
    templateUrl: "./sparqlTabComponent.html"
})
export class SparqlTabComponent extends AbstractSparqlTabComponent {

    constructor(sparqlService: SparqlServices, exportService: ExportServices, configurationsService: ConfigurationsServices,
        searchService: SearchServices, basicModals: BasicModalServices, sharedModals: SharedModalServices, graphModals: GraphModalServices, modalService: NgbModal, vbProp: VBProperties) {
        super(sparqlService, exportService, configurationsService, searchService, basicModals, sharedModals, graphModals, modalService, vbProp);
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
