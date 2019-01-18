import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";
import { D3Service } from "./d3/d3Services";
import { ForceDirectedGraph, GraphForces, GraphOptions } from "./model/ForceDirectedGraph";
import { Node } from "./model/Node";
import { Link } from "./model/Link";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class AbstractGraph {
    @Input() graph: ForceDirectedGraph;
    @Input() rendering: boolean;
    @Output() elementSelected = new EventEmitter<Node|Link>();

    private selectedElement: Link | Node;
    private linkAhead: Link; //link selected to bring ahead the other

    private initialized: boolean = false; //true once the graph will be initialized (useful in order to not render the graph view until then)
    
    protected abstract mode: GraphMode;
    protected options: GraphOptions = new GraphOptions(800, 400); //initial w & h (will be updated later)

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
        if (node == this.selectedElement) {
            this.selectedElement = null;
        } else {
            this.selectedElement = node;
        }
        this.linkAhead = null;
        this.elementSelected.emit(this.selectedElement);
    };

    protected abstract onNodeDblClicked(node: Node): void;

    protected onLinkClicked(link: Link) {
        if (link == this.selectedElement) {
            this.selectedElement = null;
        } else {
            this.selectedElement = link;
        }
        this.linkAhead = <Link>this.selectedElement;
        this.elementSelected.emit(this.selectedElement);
    };

    public updateForces(forces: GraphForces) {
        this.graph.options.forces = forces;
        this.graph.updateForces();
    }

}

export enum GraphMode {
    dataOriented = "dataOriented",
    modelOriented = "modelOriented"
}