import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTBNode, ARTLiteral } from '../../../models/ARTResources';
import { PropertyServices } from '../../../services/propertyServices';
import { ResourceUtils } from "../../../utils/ResourceUtils";

@Component({
    selector: "data-range-editor-modal",
    templateUrl: "./dataRangeEditorModal.html",
})
export class DataRangeEditorModal {
    @Input() datarangeNode: ARTBNode;

    private datarangePristine: ARTLiteral[] = [];
    datarange: ARTLiteral[] = [];

    constructor(public activeModal: NgbActiveModal, private propertyService: PropertyServices) { }

    ngOnInit() {
        this.propertyService.getDatarangeLiterals(this.datarangeNode).subscribe(
            datarange => {
                this.datarange = datarange;
                this.datarangePristine = datarange.slice(); //clone
            }
        );
    }

    ok() {
        //check if the datarange list is changed
        let changed: boolean = false;

        if (this.datarange.length != this.datarangePristine.length) { //different length => there was a change for sure
            changed = true;
        } else { //same length => there could be a replace
            //two checks:
            //if every final list element is in pristine...
            for (let i = 0; i < this.datarange.length; i++) {
                if (!ResourceUtils.containsNode(this.datarangePristine, this.datarange[i])) {
                    changed = true;
                    break;
                }
            }
            if (!changed) {
                //...and if every pristine list element is in final
                for (let i = 0; i < this.datarangePristine.length; i++) {
                    if (!ResourceUtils.containsNode(this.datarange, this.datarangePristine[i])) {
                        changed = true;
                        break;
                    }
                }
            }
        }
        if (changed) {
            //invoke service to update the datarange
            this.propertyService.updateDataranges(this.datarangeNode, this.datarange).subscribe(
                stResp => {
                    this.activeModal.close();
                }
            );
        } else {
            this.cancel();
        }

    }

    cancel() {
        this.activeModal.dismiss();
    }

}
