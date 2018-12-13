import { Directive, ElementRef, Input } from '@angular/core';
import { D3Service } from './d3Services';
import { ForceDirectedGraph } from '../model/ForceDirectedGraph';
import { Node } from '../model/Node';

@Directive({
    selector: '[draggableNode]'
})
export class DraggableDirective {
    @Input('draggableNode') draggableNode: Node;
    @Input('draggableInGraph') draggableInGraph: ForceDirectedGraph;

    constructor(private d3Service: D3Service, private _element: ElementRef) { }

    ngOnInit() {
        this.d3Service.applyDraggableBehaviour(this._element.nativeElement, this.draggableNode, this.draggableInGraph);
    }
}