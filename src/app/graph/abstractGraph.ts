import { ChangeDetectorRef, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { D3Service } from "./d3/d3Services";
import { ForceDirectedGraph, GraphForces, GraphOptions } from "./model/ForceDirectedGraph";
import { Link } from "./model/Link";
import { Node } from "./model/Node";

export abstract class AbstractGraph {
    @Input() graph: ForceDirectedGraph;
    @Input() rendering: boolean;
    @Output() elementSelected = new EventEmitter<Node|Link>();

    @ViewChild('svg') public svgElement: ElementRef;
    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

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

    protected onBackgroundClicked() {
        this.selectedElement = null;
        this.linkAhead = null;
        this.elementSelected.emit(this.selectedElement);
    }

    public updateForces(forces: GraphForces) {
        this.graph.options.forces = forces;
        this.graph.updateForces();
    }

    public getExportUrl(): string {
        let svgDom: HTMLElement = this.svgElement.nativeElement; 
        let clonedSvg: HTMLElement = <HTMLElement>svgDom.cloneNode(true);

        ExportGraphUtils.processDom(clonedSvg, svgDom);

        let serializer = new XMLSerializer();
        let source = serializer.serializeToString(clonedSvg);
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;//add xml declaration
        source = source.replace(/<!--[\s\S]*?-->/g, "");//remove comments
        
        var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source); //convert svg source to URI data scheme.
        return url;


        // let svgDom: HTMLElement = this.svgElement.nativeElement; 
        // let clonedSvg: HTMLElement = <HTMLElement>svgDom.cloneNode(true);

        // ExportGraphUtils.processDom(clonedSvg, svgDom);

        // let serializer = new XMLSerializer();
        // let source = serializer.serializeToString(clonedSvg);
        // source = source.replace(/<!--[\s\S]*?-->/g, "");//remove comments

        // let img = new Image();
        // img.src = 'data:image/svg+xml;base64,' + window.btoa(source);

        // var canvas = document.createElement("canvas");
        // document.body.appendChild(canvas);
        // canvas.getContext("2d").drawImage(img, 0, 0);

        // var url = canvas.toDataURL("image/png");
        // return url;
    }

}

export enum GraphMode {
    dataOriented = "dataOriented",
    modelOriented = "modelOriented"
}


class ExportGraphUtils {

    private static svgElementToProcess: string[] = ["svg", "path", "rect", "circle", "stop", "text"];
    private static relevantStyleForElement: { [tag: string]: string[] } = {
        svg: ["background-color", "width", "height"],
        path: ["fill", "stroke", "stroke-width"],
        rect: ["fill", "stroke", "stroke-width"],
        circle: ["fill", "stroke", "stroke-width"],
        stop: ["stop-color"],
        text: ["font", "stroke", "stroke-width"]
    };
    
    public static processDom(targetEl: HTMLElement, sourceEl: HTMLElement) {
        if (this.svgElementToProcess.indexOf(targetEl.tagName) != -1) { //if the element is one of the processingTagNames
            this.copyStyleAsInline(targetEl, sourceEl); //compy the computed style of the source as inline style in the target
        }
        this.removeNgAttributes(targetEl);
        let targetChildren: HTMLCollection = targetEl.children;
        let sourceChildren: HTMLCollection = sourceEl.children;
        for (var i = 0; i < targetChildren.length; i++) {
            let targetChildEl: HTMLElement = <HTMLElement>targetChildren.item(i);
            let sourceChildEl: HTMLElement = <HTMLElement>sourceChildren.item(i);
            this.processDom(targetChildEl, sourceChildEl);
        }
    }

    private static copyStyleAsInline(targetEl: HTMLElement, sourceEl: HTMLElement) {
        let sourceElComputedStyle: CSSStyleDeclaration = getComputedStyle(sourceEl); //for the the computed style
        let stylesForElement = this.relevantStyleForElement[sourceEl.tagName];
        stylesForElement.forEach(stylePropName => {
            let stylePropValue = sourceElComputedStyle.getPropertyValue(stylePropName); //get only the relevant css properties
            if (stylePropValue) {
                targetEl.style[stylePropName] = stylePropValue; //and set inline
            }
        });
    }

    private static removeNgAttributes(el: HTMLElement) {
        let attrs: NamedNodeMap = el.attributes;
        for (let i = attrs.length-1; i >= 0; i--) {
            let attr = attrs.item(i).name;
            if (attr.startsWith("_ng") || attr.startsWith("ng-")) {
                el.removeAttribute(attr);
            }
        }
    }

}