import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { CatalogRecord2 } from 'src/app/models/Metadata';
import { MetadataRegistryServices } from 'src/app/services/metadataRegistryServices';
import { MetadataRegistryTreeNodeComponent } from './mdrTreeNodeComponent';

@Component({
    selector: "mdr-tree",
    templateUrl: "./mdrTreeComponent.html",
    styleUrls: ['./mdrTree.css'],
    host: { class: "treeListComponent" }
})
export class MetadataRegistryTreeComponent {

    @Input() context: MdrTreeContext;
    @Output() nodeSelected = new EventEmitter<CatalogRecord2>();
    @ViewChild('blockDivTree', { static: true }) public blockDivElement: ElementRef;
    @ViewChildren(MetadataRegistryTreeNodeComponent) viewChildrenNode: QueryList<MetadataRegistryTreeNodeComponent>;

    rootDatasets: CatalogRecord2[] = [];

    selectedDataset: CatalogRecord2;

    constructor(private metadataRegistryService: MetadataRegistryServices) { }

    ngOnInit() {
        this.init();
    }

    init() {
        this.selectedDataset = null;

        this.metadataRegistryService.listRootDatasets().subscribe(
            records => {
                this.rootDatasets = records;
            }
        );
    }

    onNodeSelected(node: CatalogRecord2) {
        if (this.selectedDataset != null) {
            this.selectedDataset['selected'] = false;
        }
        this.selectedDataset = node;
        node['selected'] = true;
        this.nodeSelected.emit(node);
    }

}

export enum MdrTreeContext {
    //to set when mdr tree works for the assisted search (allows only the creation of concrete datasets)
    assistedSearch = "assistedSearch"
}