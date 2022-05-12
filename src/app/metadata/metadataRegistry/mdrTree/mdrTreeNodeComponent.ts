import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { ARTLiteral } from 'src/app/models/ARTResources';
import { LanguageUtils } from 'src/app/models/LanguagesCountries';
import { CatalogRecord2, DatasetNature } from 'src/app/models/Metadata';
import { MetadataRegistryServices } from 'src/app/services/metadataRegistryServices';
import { Deserializer } from 'src/app/utils/Deserializer';

@Component({
    selector: "mdr-tree-node",
    templateUrl: "./mdrTreeNodeComponent.html",
    styleUrls: ['./mdrTree.css'],
})
export class MetadataRegistryTreeNodeComponent {

    @Input() record: CatalogRecord2;
    @Input() root: boolean = true;
    @Output() nodeSelected = new EventEmitter<CatalogRecord2>();

    @ViewChildren(MetadataRegistryTreeNodeComponent) viewChildrenNode: QueryList<MetadataRegistryTreeNodeComponent>;

    children: CatalogRecord2[] = [];
    open: boolean = false;

    showExpandCollapseBtn: boolean = false; //tells if the expand/collapse node button should be visible (it depends on more_attr and showDeprecated)

    title: ARTLiteral;
    issuedLocal: string;
    modifiedLocal: string;

    constructor(private metadataRegistryService: MetadataRegistryServices, private translate: TranslateService) {}

    ngOnInit() {
        this.showExpandCollapseBtn = this.record.dataset.nature == DatasetNature.ABSTRACT;

        this.title = LanguageUtils.getLocalizedLiteral(this.record.dataset.titles, this.translate.currentLang);
        this.issuedLocal = Deserializer.parseDateTime(this.record.issued);
        this.modifiedLocal = this.record.modified ? Deserializer.parseDateTime(this.record.modified) : null;
    }

    selectNode() {
        this.nodeSelected.emit(this.record);
    }

    expandNode() {
        this.open = true;
        this.metadataRegistryService.listConnectedDatasets(this.record.dataset.identity).subscribe(
            records => {
                this.children = records;
            }
        );
    }

    collapseNode() {
        this.open = false;
        this.children = [];
    }

    onNodeSelected(node: CatalogRecord2) {
        this.nodeSelected.emit(node);
    }

}
