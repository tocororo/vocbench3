import { Component, ElementRef, Input, SimpleChanges, ViewChild } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatasetMetadata2, LinksetMetadata } from 'src/app/models/Metadata';
import { MetadataRegistryServices } from 'src/app/services/metadataRegistryServices';
import { UIUtils } from 'src/app/utils/UIUtils';

@Component({
    selector: "linksets-panel",
    templateUrl: "./linksetPanelComponent.html",
    host: { class: "vbox" },
})
export class LinksetPanelComponent {

    @Input() dataset: DatasetMetadata2;
    @ViewChild('blockingDiv') blockingDivElement: ElementRef;

    linksets: LinksetMetadata[];

    showPercentage: boolean;
    
    constructor(private metadataRegistryService: MetadataRegistryServices, private modalService: NgbModal) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset'] && changes['dataset'].currentValue) {
            this.initLinkets();
        }
    }

    private initLinkets() {
        if (this.blockingDivElement) UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.metadataRegistryService.getEmbeddedLinksets(this.dataset.identity).subscribe(
            linksets => {
                if (this.blockingDivElement) UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.linksets = linksets;
            }
        );
    }


}