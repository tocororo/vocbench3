// import { CompleterData, CompleterItem } from 'ng2-completer';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { SearchSettings } from "../../models/Properties";
import { SearchServices } from "../../services/searchServices";
import { VBRequestOptions } from '../../utils/HttpManager';
import { ProjectContext, VBContext } from '../../utils/VBContext';

export class CustomCompleterData 
// extends Subject<CompleterItem[]> implements CompleterData 
{

    private activeSchemes: ARTURIResource[];
    private cls: ARTURIResource;
    private projectCtx: ProjectContext;
    
    constructor(private searchService: SearchServices, private role: RDFResourceRolesEnum, private searchSettings: SearchSettings) {
        // super();
    }

    public search(term: string): void {
        let langsParam: string[];
        let includeLocales: boolean;
        if (this.searchSettings.restrictLang) {
            langsParam = this.searchSettings.languages;
            includeLocales = this.searchSettings.includeLocales;
        }
        let schemesParam: ARTURIResource[];
        if (this.searchSettings.restrictActiveScheme) {
            schemesParam = this.activeSchemes;
        }
        let clsParam: ARTURIResource;
        if (this.role == RDFResourceRolesEnum.individual && !this.searchSettings.extendToAllIndividuals) {
            clsParam = this.cls;
        }
        let concTreePref = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences;
        this.searchService.searchStringList(term, [this.role], this.searchSettings.useLocalName, this.searchSettings.stringMatchMode, 
            langsParam, includeLocales, schemesParam, concTreePref.multischemeMode, clsParam, VBRequestOptions.getRequestOptions(this.projectCtx)).pipe(
            map(strings => {
                // let results: CompleterItem[] = [];
                // strings.slice(0, 100).forEach(s => {
                //     results.push({title: s, originalObject: s});
                // })
                // this.next(results);
            })
        ).subscribe();
    }

    public cancel() {
        // Handle cancel
    }

    public updateSearchSettings(searchSettings: SearchSettings) {
        this.searchSettings = searchSettings;
    }

    public setProjectCtx(projectCtx: ProjectContext) {
        this.projectCtx = projectCtx;
    }

    public setConceptSchemes(schemes: ARTURIResource[]) {
        this.activeSchemes = schemes;
    }

    public setClass(cls: ARTURIResource) {
        this.cls = cls;
    }

}