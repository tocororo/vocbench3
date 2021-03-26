import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[resizable]'
})
export class ResizableDirective {

    private readonly MIN_WIDTH: number = 400;
    private readonly MIN_HEIGHT: number = 200;

    /**
     * <div class="modal-content"> element ref, changes must be applied to this (and not to the elem referenced by the directive)
     * otherwise horizontal resize on modal doesn't work
     */
    private modalContent: HTMLElement;

    constructor(private el: ElementRef) {}

    ngAfterViewInit() {
        this.ensureModalContentInitialized(this.el.nativeElement);
        this.modalContent.style.resize = "both";
        this.modalContent.style.overflow = "auto";
        this.modalContent.style.minWidth = this.MIN_WIDTH+"px";
        this.modalContent.style.minHeight = this.MIN_HEIGHT+"px";
    }

    /**
     * The following commented code is an alternative (more low-level) way to resize modal.
     * The above seems to work fine, anyway I'll keep the following just as backup if something with the above solution
     * may not work fine.
     */

    // constructor(private el: ElementRef, private renderer: Renderer2) {
    //     //add the dragger at the bottom right corner of the dialog
    //     this.renderer.setStyle(this.el.nativeElement, "position", "relative");
    //     let resizer: HTMLElement = document.createElement('i');
    //     resizer.style.position = "absolute";
    //     resizer.style.bottom = "-2px";
    //     resizer.style.right = "2px";
    //     resizer.style.transform = "rotate(45deg)";
    //     resizer.style.fontSize = "1.3rem";
    //     resizer.style.color = "gray";
    //     resizer.style.cursor = "nw-resize";
    //     resizer.classList.add("fas");
    //     resizer.classList.add("fa-caret-right");
    //     resizer.addEventListener("mousedown", this.onMouseDown.bind(this));
    //     this.renderer.appendChild(this.el.nativeElement, resizer);
    // }

    // private resizing: boolean = false; //tells if the resizing is being performed (enabled once the resizer is clicked)
    // private oldPos: MousePosition; //stores the position of the cursor in order to check the movement directions

    // onMouseDown(event: MouseEvent) {
    //     this.resizing = true; //start resizing
    //     this.oldPos = { x: event.clientX, y: event.clientY };
    // }

    // @HostListener('document:mousemove', ['$event'])
    // onMouseMove(event: MouseEvent) {
    //     if (this.resizing) { //if its dragging
    //         this.resize(event); //resize
    //         this.oldPos = { x: event.clientX, y: event.clientY }; //update position
    //     }
    // }

    // @HostListener('document:mouseup', ['$event'])
    // onMouseUp(event: MouseEvent) {
    //     this.resizing = false; //stop resizing
    // }

    // resize(event: MouseEvent) {
    //     this.ensureModalContentInitialized(this.el.nativeElement);
    //     let newPos: MousePosition = { x: event.clientX, y: event.clientY };
    //     let diffX: number = newPos.x - this.oldPos.x;
    //     let diffY: number = newPos.y - this.oldPos.y;
    //     let modalContentRect = this.modalContent.getBoundingClientRect();
    //     let initWidth = modalContentRect.width;
    //     let initHeight = modalContentRect.height;
    //     let newWidth = initWidth + diffX;
    //     let newHeight = initHeight + diffY;
    //     if (newWidth > this.MIN_WIDTH) {
    //         this.renderer.setStyle(this.modalContent, "width", newWidth + "px");
    //     }
    //     if (newHeight > this.MIN_HEIGHT) {
    //         this.renderer.setStyle(this.modalContent, "height", newHeight + "px");
    //     }
    //     if (newWidth <= this.MIN_WIDTH && newHeight <= this.MIN_HEIGHT) {
    //         this.resizing = false; //stop resizing
    //     }
    // }


    /**
     * Inspired by https://github.com/angular/components/blob/b8d83cb0f4d990a1cb8a976b2383817b304e4dcd/src/cdk/drag-drop/directives/drag.ts#L536
     * Starting from the directive referenced element, and going from parent to parent in the DOM tree, 
     * initializes the reference to .modal-content div element. This is needed in order to apply the changes to such div.
     * @param element 
     * @returns 
     */
    private ensureModalContentInitialized(element: HTMLElement) {
        if (this.modalContent == null) {
            let currentElement = element.parentElement as HTMLElement | null;
            while (currentElement) {
                // IE doesn't support `matches` so we have to fall back to `msMatchesSelector`.
                if (currentElement.matches ? currentElement.matches(".modal-content") : (currentElement as any).msMatchesSelector(".modal-content")) {
                    this.modalContent = currentElement;
                }
                currentElement = currentElement.parentElement;
            }
        }
    }


}

interface MousePosition { x: number, y: number }