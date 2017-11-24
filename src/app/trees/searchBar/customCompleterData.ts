import { Subject } from "rxjs/Subject";
import { CompleterService, CompleterData, CompleterItem } from 'ng2-completer';
import { SearchServices } from "../../services/searchServices";
import { RDFResourceRolesEnum, ARTURIResource } from "../../models/ARTResources";
import { SearchSettings, ClassIndividualPanelSearchMode } from "../../utils/VBProperties";

export class CustomCompleterData extends Subject<CompleterItem[]> implements CompleterData {

    private activeSchemes: ARTURIResource[];
    
    constructor(private searchService: SearchServices, private roles: RDFResourceRolesEnum[], private searchSettings: SearchSettings) {
        super();
    }

    public search(term: string): void {
        let langsParam: string[];
        if (this.searchSettings.restrictLang) {
            langsParam = this.searchSettings.languages;
        }
        let schemesParam: ARTURIResource[];
        if (this.searchSettings.restrictActiveScheme) {
            schemesParam = this.activeSchemes;
        }
        let rolesParam: RDFResourceRolesEnum[] = this.roles;
        if (this.roles.indexOf(RDFResourceRolesEnum.cls) != -1 && this.roles.indexOf(RDFResourceRolesEnum.individual) != -1) {
            if (this.searchSettings.classIndividualSearchMode == ClassIndividualPanelSearchMode.onlyClasses) {
                rolesParam = [RDFResourceRolesEnum.cls];
            } else if (this.searchSettings.classIndividualSearchMode == ClassIndividualPanelSearchMode.onlyInstances) {
                rolesParam = [RDFResourceRolesEnum.individual];
            }
        }
        this.searchService.searchStringList(term, rolesParam, this.searchSettings.useLocalName, this.searchSettings.stringMatchMode, 
            langsParam, schemesParam).map(
            strings => {
                let results: CompleterItem[] = [];
                strings.slice(0, 100).forEach(s => {
                    results.push({title: s, originalObject: s});
                })
                this.next(results);
            }
        ).subscribe();
    }

    public cancel() {
        // Handle cancel
    }

    public updateSearchSettings(searchSettings: SearchSettings) {
        this.searchSettings = searchSettings;
    }

    public setConceptSchemes(schemes: ARTURIResource[]) {
        this.activeSchemes = schemes;
    }

}