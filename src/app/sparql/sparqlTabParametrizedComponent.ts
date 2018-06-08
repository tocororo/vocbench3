import { Component, Input } from "@angular/core";
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs/observable";
import { ARTNode } from "../models/ARTResources";
import { Configuration, ConfigurationComponents, ConfigurationProperty } from "../models/Configuration";
import { SettingsProp } from "../models/Plugins";
import { VariableBindings } from "../models/Sparql";
import { ConfigurationsServices } from "../services/configurationsServices";
import { ExportServices } from "../services/exportServices";
import { SearchServices } from "../services/searchServices";
import { SparqlServices } from "../services/sparqlServices";
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { LoadConfigurationModalReturnData } from "../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from '../widget/modal/sharedModal/sharedModalServices';
import { AbstractSparqlTabComponent } from "./abstractSparqlTabComponent";

@Component({
    selector: "sparql-tab-param",
    templateUrl: "./sparqlTabParametrizedComponent.html"
})
export class SparqlTabParametrizedComponent extends AbstractSparqlTabComponent {

    //query
    private storedQueryName: string;

    //parameterization
    private parameterization: VariableBindings;
    private parametrizationRef: string;
    private bindingsMap: Map<string, ARTNode>;

    constructor(sparqlService: SparqlServices, exportService: ExportServices, configurationsService: ConfigurationsServices,
        searchService: SearchServices, basicModals: BasicModalServices, sharedModals: SharedModalServices, modal: Modal) {
        super(sparqlService, exportService, configurationsService, searchService, basicModals, sharedModals, modal);
    }

    evaluateQueryImpl(): Observable<any> {
        return this.sparqlService.evaluateQuery(this.query, this.inferred, null, this.bindingsMap);
    }

    executeUpdateImpl(): Observable<any> {
        return this.sparqlService.executeUpdate(this.query, this.inferred, null, this.bindingsMap);
    }

    //LOAD/SAVE/PARAMETERIZE QUERY

    private changeStoredQuery() {
        this.sharedModals.loadConfiguration("Load SPARQL query", ConfigurationComponents.SPARQL_STORE).then(
            (data: LoadConfigurationModalReturnData) => {
                this.storedQueryReference = data.relativeReference;
                this.storedQueryName = this.storedQueryReference.substring(this.storedQueryReference.indexOf(":")+1);
                this.setLoadedQueryConf(data.configuration);
                setTimeout(() => {
                    this.savedStatus.emit(false);
                });
            }
        );
    }

    loadConfiguration() {
        this.sharedModals.loadConfiguration("Load SPARQL parameterized query", ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE).then(
            (data: LoadConfigurationModalReturnData) => {
                this.parametrizationRef = data.relativeReference;
                this.loadParameterizedQueryConfig(data.configuration);

                this.updateName.emit(data.relativeReference.substring(data.relativeReference.indexOf(":")+1));
            },
            () => {}
        );
    }

    private loadParameterizedQueryConfig(configuration: Configuration) {
        /**
         * configuration contains 2 props:
         * "relativeReference": the reference of the query
         * "variableBindings": the map of the bindings parameterization
         */
        let properties: SettingsProp[] = configuration.properties;
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].name == "relativeReference") {
                this.storedQueryReference = properties[i].value;
                this.storedQueryName = this.storedQueryReference.substring(this.storedQueryReference.indexOf(":")+1);
                //load query
                this.configurationsService.getConfiguration(ConfigurationComponents.SPARQL_STORE, this.storedQueryReference).subscribe(
                    (conf: Configuration) => {
                        this.setLoadedQueryConf(conf);
                        setTimeout(() => {
                            this.savedStatus.emit(true);
                        });
                        
                    }
                );
            } else if (properties[i].name == "variableBindings") {
                this.parameterization = properties[i].value;
            }
        }
    }

    /**
     * @Override the method defined in the abstract component since it emits a savedStatus to true, 
     * but in the parametrized query, if the query changed the status should unsaved.
     * In this case the savedStatus false event is emitted in changeStoredQuery
     * @param conf 
     */
    setLoadedQueryConf(conf: Configuration) {
        let query: string;
        let includeInferred: boolean = false;
        let confProps: ConfigurationProperty[] = conf.properties;
        for (var i = 0; i < confProps.length; i++) {
            if (confProps[i].name == "sparql") {
                query = confProps[i].value;
            } else if (confProps[i].name == "includeInferred") {
                includeInferred = confProps[i].value;
            }
        }
        this.query = query;
        this.inferred = includeInferred;
        setTimeout(() => {
            //in order to detect the change of @Input query in the child YasguiComponent
            this.viewChildYasgui.forceContentUpdate();
        });
    }

    saveConfiguration() {
        let config: { [key: string]: any } = {
            relativeReference: this.storedQueryReference,
            variableBindings: this.parameterization
        }
        this.sharedModals.storeConfiguration("Save SPARQL query parameterization", ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE, config, this.parametrizationRef).then(
            (relativeRef: string) => {
                this.basicModals.alert("Save query parameterization", "Query parameterization saved succesfully");
                this.updateName.emit(relativeRef.substring(relativeRef.indexOf(":")+1));
                this.savedStatus.emit(true);
            },
            () => {}
        )
    }

    private onParametrizationsChange(parameterization: VariableBindings) {
        this.parameterization = parameterization;
        this.savedStatus.emit(false);
    }

    private onVarBindingsUpdate(bindings: Map<string, ARTNode>) {
        this.bindingsMap = bindings;
    }

}
