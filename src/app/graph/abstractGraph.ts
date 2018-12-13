import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";
import { D3Service } from "./d3/d3Services";
import { ForceDirectedGraph, GraphOptions } from "./model/ForceDirectedGraph";
import { Node } from "./model/Node";

@Component({
    selector: "",
    template: "",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class AbstractGraph {
    @Input() graph: ForceDirectedGraph;
    @Input() mode: GraphMode;
    @Input() rendering: boolean;
    @Output() nodeSelected = new EventEmitter<Node>();

    private initialized: boolean = false; //true once the graph will be initialized (useful in order to not render the graph view until then)

    // protected graph: ForceDirectedGraph;
    protected options: GraphOptions = { width: 800, height: 400 }; //initial w & h (will be updated later)

    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef) { }

    //In ngAfterViewInit instead of ngOnInit since I need offsetWidth and offsetHeight that are fixed only once the view is initialized
    ngAfterViewInit() {
        this.options.width = this.elementRef.nativeElement.offsetWidth;
        this.options.height = this.elementRef.nativeElement.offsetHeight;

        this.graph.ticker.subscribe((d: any) => {
            this.ref.markForCheck();
        });
        this.graph.initSimulation(this.options);
        this.initialized = true;
    }

    protected onNodeClicked(node: Node) {
        this.nodeSelected.emit(node);
    };

    protected abstract onNodeDblClicked(node: Node): void;

}

export enum GraphMode {
    dataOriented = "dataOriented",
    modelOriented = "modelOriented"
}