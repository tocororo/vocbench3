import {NgModule} from '@angular/core';

import {HttpModule} from '@angular/http';

import {AdministrationServices} from "./administrationServices";
import {AlignmentServices} from "./alignmentServices";
import {CustomRangeServices} from "./customRangeServices";
import {DeleteServices} from "./deleteServices";
import {IcvServices} from "./icvServices";
import {InputOutputServices} from "./inputOutputServices";
import {ManchesterServices} from "./manchesterServices";
import {MetadataServices} from "./metadataServices";
import {OntoManagerServices} from "./ontoManagerServices";
import {OwlServices} from "./owlServices";
import {PluginsServices} from "./pluginsServices";
import {ProjectServices} from "./projectServices";
import {PropertyServices} from "./propertyServices";
import {RefactorServices} from "./refactorServices";
import {ResourceServices} from "./resourceServices";
import {ResourceViewServices} from "./resourceViewServices";
import {SearchServices} from "./searchServices";
import {SkosServices} from "./skosServices";
import {SkosxlServices} from "./skosxlServices";
import {SparqlServices} from "./sparqlServices";

@NgModule({
    imports: [HttpModule],
    declarations: [],
    exports: [],
    providers: [
        AdministrationServices,
        AlignmentServices,
        CustomRangeServices,
        DeleteServices,
        IcvServices,
        InputOutputServices,
        ManchesterServices,
        MetadataServices,
        OntoManagerServices,
        OwlServices,
        PluginsServices,
        ProjectServices,
        PropertyServices,
        RefactorServices,
        ResourceServices,
        ResourceViewServices,
        SearchServices,
        SkosServices,
        SkosxlServices,
        SparqlServices
    ]
})
export class STServicesModule {}