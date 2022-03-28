import { DomSanitizer } from '@angular/platform-browser';
import { Component, Inject, Input, ViewEncapsulation } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./quill.service";
import * as i2 from "@angular/common";
import * as i3 from "@angular/platform-browser";
export class QuillViewHTMLComponent {
    constructor(sanitizer, service) {
        this.sanitizer = sanitizer;
        this.service = service;
        this.content = '';
        this.innerHTML = '';
        this.themeClass = 'ql-snow';
    }
    ngOnChanges(changes) {
        if (changes.theme) {
            const theme = changes.theme.currentValue || (this.service.config.theme ? this.service.config.theme : 'snow');
            this.themeClass = `ql-${theme} ngx-quill-view-html`;
        }
        else if (!this.theme) {
            const theme = this.service.config.theme ? this.service.config.theme : 'snow';
            this.themeClass = `ql-${theme} ngx-quill-view-html`;
        }
        if (changes.content) {
            const content = changes.content.currentValue;
            const sanitize = [true, false].includes(this.sanitize) ? this.sanitize : (this.service.config.sanitize || false);
            this.innerHTML = sanitize ? content : this.sanitizer.bypassSecurityTrustHtml(content);
        }
    }
}
QuillViewHTMLComponent.ɵfac = function QuillViewHTMLComponent_Factory(t) { return new (t || QuillViewHTMLComponent)(i0.ɵɵdirectiveInject(DomSanitizer), i0.ɵɵdirectiveInject(i1.QuillService)); };
QuillViewHTMLComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: QuillViewHTMLComponent, selectors: [["quill-view-html"]], inputs: { content: "content", theme: "theme", sanitize: "sanitize" }, features: [i0.ɵɵNgOnChangesFeature], decls: 2, vars: 2, consts: [[1, "ql-container", 3, "ngClass"], [1, "ql-editor", 3, "innerHTML"]], template: function QuillViewHTMLComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵelement(1, "div", 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵproperty("ngClass", ctx.themeClass);
        i0.ɵɵadvance(1);
        i0.ɵɵproperty("innerHTML", ctx.innerHTML, i0.ɵɵsanitizeHtml);
    } }, directives: [i2.NgClass], styles: [".ql-container.ngx-quill-view-html{border:0}\n"], encapsulation: 2 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(QuillViewHTMLComponent, [{
        type: Component,
        args: [{
                encapsulation: ViewEncapsulation.None,
                selector: 'quill-view-html',
                styles: [`
.ql-container.ngx-quill-view-html {
  border: 0;
}
`],
                template: `
  <div class="ql-container" [ngClass]="themeClass">
    <div class="ql-editor" [innerHTML]="innerHTML">
    </div>
  </div>
`
            }]
    }], function () { return [{ type: i3.DomSanitizer, decorators: [{
                type: Inject,
                args: [DomSanitizer]
            }] }, { type: i1.QuillService }]; }, { content: [{
            type: Input
        }], theme: [{
            type: Input
        }], sanitize: [{
            type: Input
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpbGwtdmlldy1odG1sLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1xdWlsbC9zcmMvbGliL3F1aWxsLXZpZXctaHRtbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBWSxNQUFNLDJCQUEyQixDQUFBO0FBR2xFLE9BQU8sRUFDTCxTQUFTLEVBQ1QsTUFBTSxFQUNOLEtBQUssRUFHTCxpQkFBaUIsRUFDbEIsTUFBTSxlQUFlLENBQUE7Ozs7O0FBaUJ0QixNQUFNLE9BQU8sc0JBQXNCO0lBUWpDLFlBQ2dDLFNBQXVCLEVBQzNDLE9BQXFCO1FBREQsY0FBUyxHQUFULFNBQVMsQ0FBYztRQUMzQyxZQUFPLEdBQVAsT0FBTyxDQUFjO1FBVHhCLFlBQU8sR0FBRyxFQUFFLENBQUE7UUFJckIsY0FBUyxHQUFhLEVBQUUsQ0FBQTtRQUN4QixlQUFVLEdBQUcsU0FBUyxDQUFBO0lBS25CLENBQUM7SUFFSixXQUFXLENBQUMsT0FBc0I7UUFDaEMsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ2pCLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQzVHLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxLQUFLLHNCQUFzQixDQUFBO1NBQ3BEO2FBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDdEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQTtZQUM1RSxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sS0FBSyxzQkFBc0IsQ0FBQTtTQUNwRDtRQUNELElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUNuQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQTtZQUM1QyxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsQ0FBQTtZQUVoSCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFBO1NBQ3RGO0lBQ0gsQ0FBQzs7NEZBM0JVLHNCQUFzQix1QkFTdkIsWUFBWTt5RUFUWCxzQkFBc0I7UUFOakMsOEJBQWlEO1FBQy9DLHlCQUNNO1FBQ1IsaUJBQU07O1FBSG9CLHdDQUFzQjtRQUN2QixlQUF1QjtRQUF2Qiw0REFBdUI7O3VGQUtyQyxzQkFBc0I7Y0FmbEMsU0FBUztlQUFDO2dCQUNULGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2dCQUNyQyxRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixNQUFNLEVBQUUsQ0FBQzs7OztDQUlWLENBQUM7Z0JBQ0EsUUFBUSxFQUFFOzs7OztDQUtYO2FBQ0E7O3NCQVVJLE1BQU07dUJBQUMsWUFBWTttREFSYixPQUFPO2tCQUFmLEtBQUs7WUFDRyxLQUFLO2tCQUFiLEtBQUs7WUFDRyxRQUFRO2tCQUFoQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRG9tU2FuaXRpemVyLCBTYWZlSHRtbCB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInXG5pbXBvcnQgeyBRdWlsbFNlcnZpY2UgfSBmcm9tICcuL3F1aWxsLnNlcnZpY2UnXG5cbmltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJ1xuXG5AQ29tcG9uZW50KHtcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgc2VsZWN0b3I6ICdxdWlsbC12aWV3LWh0bWwnLFxuICBzdHlsZXM6IFtgXG4ucWwtY29udGFpbmVyLm5neC1xdWlsbC12aWV3LWh0bWwge1xuICBib3JkZXI6IDA7XG59XG5gXSxcbiAgdGVtcGxhdGU6IGBcbiAgPGRpdiBjbGFzcz1cInFsLWNvbnRhaW5lclwiIFtuZ0NsYXNzXT1cInRoZW1lQ2xhc3NcIj5cbiAgICA8ZGl2IGNsYXNzPVwicWwtZWRpdG9yXCIgW2lubmVySFRNTF09XCJpbm5lckhUTUxcIj5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG5gXG59KVxuZXhwb3J0IGNsYXNzIFF1aWxsVmlld0hUTUxDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICBASW5wdXQoKSBjb250ZW50ID0gJydcbiAgQElucHV0KCkgdGhlbWU/OiBzdHJpbmdcbiAgQElucHV0KCkgc2FuaXRpemU/OiBib29sZWFuXG5cbiAgaW5uZXJIVE1MOiBTYWZlSHRtbCA9ICcnXG4gIHRoZW1lQ2xhc3MgPSAncWwtc25vdydcblxuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KERvbVNhbml0aXplcikgcHJpdmF0ZSBzYW5pdGl6ZXI6IERvbVNhbml0aXplcixcbiAgICBwcm90ZWN0ZWQgc2VydmljZTogUXVpbGxTZXJ2aWNlXG4gICkge31cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKGNoYW5nZXMudGhlbWUpIHtcbiAgICAgIGNvbnN0IHRoZW1lID0gY2hhbmdlcy50aGVtZS5jdXJyZW50VmFsdWUgfHwgKHRoaXMuc2VydmljZS5jb25maWcudGhlbWUgPyB0aGlzLnNlcnZpY2UuY29uZmlnLnRoZW1lIDogJ3Nub3cnKVxuICAgICAgdGhpcy50aGVtZUNsYXNzID0gYHFsLSR7dGhlbWV9IG5neC1xdWlsbC12aWV3LWh0bWxgXG4gICAgfSBlbHNlIGlmICghdGhpcy50aGVtZSkge1xuICAgICAgY29uc3QgdGhlbWUgPSB0aGlzLnNlcnZpY2UuY29uZmlnLnRoZW1lID8gdGhpcy5zZXJ2aWNlLmNvbmZpZy50aGVtZSA6ICdzbm93J1xuICAgICAgdGhpcy50aGVtZUNsYXNzID0gYHFsLSR7dGhlbWV9IG5neC1xdWlsbC12aWV3LWh0bWxgXG4gICAgfVxuICAgIGlmIChjaGFuZ2VzLmNvbnRlbnQpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBjaGFuZ2VzLmNvbnRlbnQuY3VycmVudFZhbHVlXG4gICAgICBjb25zdCBzYW5pdGl6ZSA9IFt0cnVlLCBmYWxzZV0uaW5jbHVkZXModGhpcy5zYW5pdGl6ZSkgPyB0aGlzLnNhbml0aXplIDogKHRoaXMuc2VydmljZS5jb25maWcuc2FuaXRpemUgfHwgZmFsc2UpXG5cbiAgICAgIHRoaXMuaW5uZXJIVE1MID0gc2FuaXRpemUgPyBjb250ZW50IDogdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdEh0bWwoY29udGVudClcbiAgICB9XG4gIH1cbn1cbiJdfQ==