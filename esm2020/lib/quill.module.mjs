import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QuillEditorComponent } from './quill-editor.component';
import { QUILL_CONFIG_TOKEN } from './quill-editor.interfaces';
import { QuillViewHTMLComponent } from './quill-view-html.component';
import { QuillViewComponent } from './quill-view.component';
import * as i0 from "@angular/core";
export class QuillModule {
    static forRoot(config) {
        return {
            ngModule: QuillModule,
            providers: [
                {
                    provide: QUILL_CONFIG_TOKEN,
                    useValue: config
                }
            ]
        };
    }
}
QuillModule.ɵfac = function QuillModule_Factory(t) { return new (t || QuillModule)(); };
QuillModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: QuillModule });
QuillModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [[CommonModule]] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(QuillModule, [{
        type: NgModule,
        args: [{
                declarations: [
                    QuillEditorComponent,
                    QuillViewComponent,
                    QuillViewHTMLComponent
                ],
                exports: [QuillEditorComponent, QuillViewComponent, QuillViewHTMLComponent],
                imports: [CommonModule],
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(QuillModule, { declarations: [QuillEditorComponent,
        QuillViewComponent,
        QuillViewHTMLComponent], imports: [CommonModule], exports: [QuillEditorComponent, QuillViewComponent, QuillViewHTMLComponent] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpbGwubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXF1aWxsL3NyYy9saWIvcXVpbGwubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUM5QyxPQUFPLEVBQXVCLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUU3RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUMvRCxPQUFPLEVBQUUsa0JBQWtCLEVBQWUsTUFBTSwyQkFBMkIsQ0FBQTtBQUMzRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTs7QUFXM0QsTUFBTSxPQUFPLFdBQVc7SUFDdEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFvQjtRQUNqQyxPQUFPO1lBQ0wsUUFBUSxFQUFFLFdBQVc7WUFDckIsU0FBUyxFQUFFO2dCQUNUO29CQUNFLE9BQU8sRUFBRSxrQkFBa0I7b0JBQzNCLFFBQVEsRUFBRSxNQUFNO2lCQUNqQjthQUNGO1NBQ0YsQ0FBQTtJQUNILENBQUM7O3NFQVhVLFdBQVc7NkRBQVgsV0FBVztpRUFGYixDQUFDLFlBQVksQ0FBQzt1RkFFWixXQUFXO2NBVHZCLFFBQVE7ZUFBQztnQkFDUixZQUFZLEVBQUU7b0JBQ1osb0JBQW9CO29CQUNwQixrQkFBa0I7b0JBQ2xCLHNCQUFzQjtpQkFDdkI7Z0JBQ0QsT0FBTyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUUsc0JBQXNCLENBQUM7Z0JBQzNFLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQzthQUN4Qjs7d0ZBQ1ksV0FBVyxtQkFQcEIsb0JBQW9CO1FBQ3BCLGtCQUFrQjtRQUNsQixzQkFBc0IsYUFHZCxZQUFZLGFBRFosb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUUsc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJ1xuaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJ1xuXG5pbXBvcnQgeyBRdWlsbEVkaXRvckNvbXBvbmVudCB9IGZyb20gJy4vcXVpbGwtZWRpdG9yLmNvbXBvbmVudCdcbmltcG9ydCB7IFFVSUxMX0NPTkZJR19UT0tFTiwgUXVpbGxDb25maWcgfSBmcm9tICcuL3F1aWxsLWVkaXRvci5pbnRlcmZhY2VzJ1xuaW1wb3J0IHsgUXVpbGxWaWV3SFRNTENvbXBvbmVudCB9IGZyb20gJy4vcXVpbGwtdmlldy1odG1sLmNvbXBvbmVudCdcbmltcG9ydCB7IFF1aWxsVmlld0NvbXBvbmVudCB9IGZyb20gJy4vcXVpbGwtdmlldy5jb21wb25lbnQnXG5cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW1xuICAgIFF1aWxsRWRpdG9yQ29tcG9uZW50LFxuICAgIFF1aWxsVmlld0NvbXBvbmVudCxcbiAgICBRdWlsbFZpZXdIVE1MQ29tcG9uZW50XG4gIF0sXG4gIGV4cG9ydHM6IFtRdWlsbEVkaXRvckNvbXBvbmVudCwgUXVpbGxWaWV3Q29tcG9uZW50LCBRdWlsbFZpZXdIVE1MQ29tcG9uZW50XSxcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXG59KVxuZXhwb3J0IGNsYXNzIFF1aWxsTW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QoY29uZmlnPzogUXVpbGxDb25maWcpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPFF1aWxsTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBRdWlsbE1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogUVVJTExfQ09ORklHX1RPS0VOLFxuICAgICAgICAgIHVzZVZhbHVlOiBjb25maWdcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgfVxufVxuIl19