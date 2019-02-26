import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ARTNode, RDFResourceRolesEnum, ResAttribute } from '../models/ARTResources';
import { ResourceUtils } from '../utils/ResourceUtils';
import { GraphMode } from './abstractGraph';
import { Node, NodeMeasure } from './model/Node';

@Component({})
export abstract class AbstractGraphNode {

    @ViewChild('textEl') textElement: ElementRef;

    @Input() rendering: boolean = true;
    @Input() selected: boolean = false;
    @Output() nodeClicked: EventEmitter<Node> = new EventEmitter<Node>();
    @Output() nodeDblClicked: EventEmitter<Node> = new EventEmitter<Node>();

    protected abstract graphMode: GraphMode;

    protected node: Node;
    protected measures: NodeMeasure;

    private nodeClass: string;
    private deprecated: boolean = false;

    protected initNode() {
        this.initNodeStyle();
        this.measures = this.node.getNodeMeaseure();
    }

    private getRendering(): string {
        return ResourceUtils.getRendering(this.node.res, this.rendering);
    }

    private getRenderingNormalized() {
        let text = this.getRendering();
        let truncatedText = text;
        if (this.textElement != null) {
            let textElementWidth = this.textElement.nativeElement.getBoundingClientRect().width;
            let nodeWidth = this.node.getNodeWidth() - 4; //subtract 4 as padding
            if (textElementWidth > nodeWidth) {
                let ratio = textElementWidth / nodeWidth;
                let truncateAt = Math.floor(truncatedText.length / ratio);
                truncatedText = truncatedText.substring(0, truncateAt);
            }
            if (text.length > truncatedText.length) {
                truncatedText = text.substring(0, truncatedText.length - 3) + "...";
            }
        }
        return truncatedText;
    }

    private initNodeStyle() {
        let res: ARTNode = this.node.res;

        if (this.node.res.isURIResource()) {
            let role: RDFResourceRolesEnum = res.getRole();
            let explicit: boolean = res.getAdditionalProperty(ResAttribute.EXPLICIT) || res.getAdditionalProperty(ResAttribute.EXPLICIT) == undefined;
            this.deprecated = res.getAdditionalProperty(ResAttribute.DEPRECATED);
            
            if (role == RDFResourceRolesEnum.annotationProperty ||
                role == RDFResourceRolesEnum.cls ||
                role == RDFResourceRolesEnum.concept ||
                role == RDFResourceRolesEnum.conceptScheme ||
                role == RDFResourceRolesEnum.dataRange ||
                role == RDFResourceRolesEnum.datatypeProperty ||
                role == RDFResourceRolesEnum.individual ||
                role == RDFResourceRolesEnum.limeLexicon ||
                role == RDFResourceRolesEnum.objectProperty ||
                role == RDFResourceRolesEnum.ontolexForm ||
                role == RDFResourceRolesEnum.ontolexLexicalEntry ||
                role == RDFResourceRolesEnum.ontolexLexicalSense ||
                role == RDFResourceRolesEnum.ontologyProperty ||
                role == RDFResourceRolesEnum.property
            ) {
                this.nodeClass = role;
                if (!explicit) {
                    this.nodeClass = role + "Imported";
                } else if (this.deprecated) {
                    this.nodeClass = role + "Deprecated";
                }
            } else if (
                role == RDFResourceRolesEnum.skosCollection ||
                role == RDFResourceRolesEnum.skosOrderedCollection
            ) {
                this.nodeClass = RDFResourceRolesEnum.skosCollection;
                if (!explicit) {
                    this.nodeClass = role + "Imported";
                } else if (this.deprecated) {
                    this.nodeClass = role + "Deprecated";
                }
            } else if (role == RDFResourceRolesEnum.ontology) {
                this.nodeClass = role;
            } else if (role == RDFResourceRolesEnum.xLabel) {
                this.nodeClass = role;
                if (!explicit) {
                    this.nodeClass = role + "Imported";
                } else if (this.deprecated) {
                    this.nodeClass = role + "Deprecated";
                }
            } else { //none of the above (maybe mention?)
                this.nodeClass = "unkwnownNode";
            }
        } else if (res.isBNode()) {
            this.nodeClass = "bnode";
        }
    }


    /**
     * Click handlers
     */

    private isSingleClick: boolean = true;

    private onClick() {
        this.isSingleClick = true;
        setTimeout(() => {
            if (this.isSingleClick) {
                this.nodeClicked.emit(this.node);
            }
        }, 250)
    }

    private onDblClick() {
        this.isSingleClick = false;
        this.nodeDblClicked.emit(this.node);
    }
}