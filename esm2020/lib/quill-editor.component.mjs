import { DOCUMENT, isPlatformServer } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ChangeDetectorRef, Component, Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, NgZone, Output, PLATFORM_ID, Renderer2, SecurityContext, ViewEncapsulation } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { defaultModules } from './quill-defaults';
import { getFormat } from './helpers';
import { QuillService } from './quill.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/platform-browser";
import * as i2 from "./quill.service";
const _c0 = [[["", "quill-editor-toolbar", ""]]];
const _c1 = ["[quill-editor-toolbar]"];
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class QuillEditorBase {
    constructor(injector, elementRef, cd, domSanitizer, platformId, renderer, zone, service) {
        this.elementRef = elementRef;
        this.cd = cd;
        this.domSanitizer = domSanitizer;
        this.platformId = platformId;
        this.renderer = renderer;
        this.zone = zone;
        this.service = service;
        this.required = false;
        this.customToolbarPosition = 'top';
        this.styles = null;
        this.strict = true;
        this.customOptions = [];
        this.customModules = [];
        this.preserveWhitespace = false;
        this.trimOnValidation = false;
        this.compareValues = false;
        this.filterNull = false;
        /*
        https://github.com/KillerCodeMonkey/ngx-quill/issues/1257 - fix null value set
      
        provide default empty value
        by default null
      
        e.g. defaultEmptyValue="" - empty string
      
        <quill-editor
          defaultEmptyValue=""
          formControlName="message"
        ></quill-editor>
        */
        this.defaultEmptyValue = null;
        this.onEditorCreated = new EventEmitter();
        this.onEditorChanged = new EventEmitter();
        this.onContentChanged = new EventEmitter();
        this.onSelectionChanged = new EventEmitter();
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();
        this.disabled = false; // used to store initial value before ViewInit
        this.subscription = null;
        this.quillSubscription = null;
        this.valueGetter = (quillEditor, editorElement) => {
            let html = editorElement.querySelector('.ql-editor').innerHTML;
            if (html === '<p><br></p>' || html === '<div><br></div>') {
                html = this.defaultEmptyValue;
            }
            let modelValue = html;
            const format = getFormat(this.format, this.service.config.format);
            if (format === 'text') {
                modelValue = quillEditor.getText();
            }
            else if (format === 'object') {
                modelValue = quillEditor.getContents();
            }
            else if (format === 'json') {
                try {
                    modelValue = JSON.stringify(quillEditor.getContents());
                }
                catch (e) {
                    modelValue = quillEditor.getText();
                }
            }
            return modelValue;
        };
        this.valueSetter = (quillEditor, value) => {
            const format = getFormat(this.format, this.service.config.format);
            if (format === 'html') {
                const sanitize = [true, false].includes(this.sanitize) ? this.sanitize : (this.service.config.sanitize || false);
                if (sanitize) {
                    value = this.domSanitizer.sanitize(SecurityContext.HTML, value);
                }
                return quillEditor.clipboard.convert(value);
            }
            else if (format === 'json') {
                try {
                    return JSON.parse(value);
                }
                catch (e) {
                    return [{ insert: value }];
                }
            }
            return value;
        };
        this.selectionChangeHandler = (range, oldRange, source) => {
            const shouldTriggerOnModelTouched = !range && !!this.onModelTouched;
            // only emit changes when there's any listener
            if (!this.onBlur.observers.length &&
                !this.onFocus.observers.length &&
                !this.onSelectionChanged.observers.length &&
                !shouldTriggerOnModelTouched) {
                return;
            }
            this.zone.run(() => {
                if (range === null) {
                    this.onBlur.emit({
                        editor: this.quillEditor,
                        source
                    });
                }
                else if (oldRange === null) {
                    this.onFocus.emit({
                        editor: this.quillEditor,
                        source
                    });
                }
                this.onSelectionChanged.emit({
                    editor: this.quillEditor,
                    oldRange,
                    range,
                    source
                });
                if (shouldTriggerOnModelTouched) {
                    this.onModelTouched();
                }
                this.cd.markForCheck();
            });
        };
        this.textChangeHandler = (delta, oldDelta, source) => {
            // only emit changes emitted by user interactions
            const text = this.quillEditor.getText();
            const content = this.quillEditor.getContents();
            let html = this.editorElem.querySelector('.ql-editor').innerHTML;
            if (html === '<p><br></p>' || html === '<div><br></div>') {
                html = this.defaultEmptyValue;
            }
            const trackChanges = this.trackChanges || this.service.config.trackChanges;
            const shouldTriggerOnModelChange = (source === 'user' || trackChanges && trackChanges === 'all') && !!this.onModelChange;
            // only emit changes when there's any listener
            if (!this.onContentChanged.observers.length && !shouldTriggerOnModelChange) {
                return;
            }
            this.zone.run(() => {
                if (shouldTriggerOnModelChange) {
                    this.onModelChange(this.valueGetter(this.quillEditor, this.editorElem));
                }
                this.onContentChanged.emit({
                    content,
                    delta,
                    editor: this.quillEditor,
                    html,
                    oldDelta,
                    source,
                    text
                });
                this.cd.markForCheck();
            });
        };
        // eslint-disable-next-line max-len
        this.editorChangeHandler = (event, current, old, source) => {
            // only emit changes when there's any listener
            if (!this.onEditorChanged.observers.length) {
                return;
            }
            // only emit changes emitted by user interactions
            if (event === 'text-change') {
                const text = this.quillEditor.getText();
                const content = this.quillEditor.getContents();
                let html = this.editorElem.querySelector('.ql-editor').innerHTML;
                if (html === '<p><br></p>' || html === '<div><br></div>') {
                    html = this.defaultEmptyValue;
                }
                this.zone.run(() => {
                    this.onEditorChanged.emit({
                        content,
                        delta: current,
                        editor: this.quillEditor,
                        event,
                        html,
                        oldDelta: old,
                        source,
                        text
                    });
                    this.cd.markForCheck();
                });
            }
            else {
                this.zone.run(() => {
                    this.onEditorChanged.emit({
                        editor: this.quillEditor,
                        event,
                        oldRange: old,
                        range: current,
                        source
                    });
                    this.cd.markForCheck();
                });
            }
        };
        this.document = injector.get(DOCUMENT);
    }
    static normalizeClassNames(classes) {
        const classList = classes.trim().split(' ');
        return classList.reduce((prev, cur) => {
            const trimmed = cur.trim();
            if (trimmed) {
                prev.push(trimmed);
            }
            return prev;
        }, []);
    }
    ngAfterViewInit() {
        if (isPlatformServer(this.platformId)) {
            return;
        }
        // The `quill-editor` component might be destroyed before the `quill` chunk is loaded and its code is executed
        // this will lead to runtime exceptions, since the code will be executed on DOM nodes that don't exist within the tree.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        this.quillSubscription = this.service.getQuill().subscribe(Quill => {
            this.elementRef.nativeElement.insertAdjacentHTML(this.customToolbarPosition === 'top' ? 'beforeend' : 'afterbegin', this.preserveWhitespace ? '<pre quill-editor-element></pre>' : '<div quill-editor-element></div>');
            this.editorElem = this.elementRef.nativeElement.querySelector('[quill-editor-element]');
            const toolbarElem = this.elementRef.nativeElement.querySelector('[quill-editor-toolbar]');
            const modules = Object.assign({}, this.modules || this.service.config.modules);
            if (toolbarElem) {
                modules.toolbar = toolbarElem;
            }
            else if (modules.toolbar === undefined) {
                modules.toolbar = defaultModules.toolbar;
            }
            let placeholder = this.placeholder !== undefined ? this.placeholder : this.service.config.placeholder;
            if (placeholder === undefined) {
                placeholder = 'Insert text here ...';
            }
            if (this.styles) {
                Object.keys(this.styles).forEach((key) => {
                    this.renderer.setStyle(this.editorElem, key, this.styles[key]);
                });
            }
            if (this.classes) {
                this.addClasses(this.classes);
            }
            this.customOptions.forEach((customOption) => {
                const newCustomOption = Quill.import(customOption.import);
                newCustomOption.whitelist = customOption.whitelist;
                Quill.register(newCustomOption, true);
            });
            this.customModules.forEach(({ implementation, path }) => {
                Quill.register(path, implementation);
            });
            let bounds = this.bounds && this.bounds === 'self' ? this.editorElem : this.bounds;
            if (!bounds) {
                bounds = this.service.config.bounds ? this.service.config.bounds : this.document.body;
            }
            let debug = this.debug;
            if (!debug && debug !== false && this.service.config.debug) {
                debug = this.service.config.debug;
            }
            let readOnly = this.readOnly;
            if (!readOnly && this.readOnly !== false) {
                readOnly = this.service.config.readOnly !== undefined ? this.service.config.readOnly : false;
            }
            let defaultEmptyValue = this.defaultEmptyValue;
            if (this.service.config.hasOwnProperty('defaultEmptyValue')) {
                defaultEmptyValue = this.service.config.defaultEmptyValue;
            }
            let scrollingContainer = this.scrollingContainer;
            if (!scrollingContainer && this.scrollingContainer !== null) {
                scrollingContainer =
                    this.service.config.scrollingContainer === null
                        || this.service.config.scrollingContainer ? this.service.config.scrollingContainer : null;
            }
            let formats = this.formats;
            if (!formats && formats === undefined) {
                formats = this.service.config.formats ? [...this.service.config.formats] : (this.service.config.formats === null ? null : undefined);
            }
            this.zone.runOutsideAngular(() => {
                this.quillEditor = new Quill(this.editorElem, {
                    bounds,
                    debug: debug,
                    formats: formats,
                    modules,
                    placeholder,
                    readOnly,
                    defaultEmptyValue,
                    scrollingContainer: scrollingContainer,
                    strict: this.strict,
                    theme: this.theme || (this.service.config.theme ? this.service.config.theme : 'snow')
                });
                // Set optional link placeholder, Quill has no native API for it so using workaround
                if (this.linkPlaceholder) {
                    const tooltip = this.quillEditor?.theme?.tooltip;
                    const input = tooltip?.root?.querySelector('input[data-link]');
                    if (input?.dataset) {
                        input.dataset.link = this.linkPlaceholder;
                    }
                }
            });
            if (this.content) {
                const format = getFormat(this.format, this.service.config.format);
                if (format === 'text') {
                    this.quillEditor.setText(this.content, 'silent');
                }
                else {
                    const newValue = this.valueSetter(this.quillEditor, this.content);
                    this.quillEditor.setContents(newValue, 'silent');
                }
                this.quillEditor.getModule('history').clear();
            }
            // initialize disabled status based on this.disabled as default value
            this.setDisabledState();
            this.addQuillEventListeners();
            // The `requestAnimationFrame` triggers change detection. There's no sense to invoke the `requestAnimationFrame` if anyone is
            // listening to the `onEditorCreated` event inside the template, for instance `<quill-view (onEditorCreated)="...">`.
            if (!this.onEditorCreated.observers.length && !this.onValidatorChanged) {
                return;
            }
            // The `requestAnimationFrame` will trigger change detection and `onEditorCreated` will also call `markDirty()`
            // internally, since Angular wraps template event listeners into `listener` instruction. We're using the `requestAnimationFrame`
            // to prevent the frame drop and avoid `ExpressionChangedAfterItHasBeenCheckedError` error.
            requestAnimationFrame(() => {
                if (this.onValidatorChanged) {
                    this.onValidatorChanged();
                }
                this.onEditorCreated.emit(this.quillEditor);
            });
        });
    }
    ngOnDestroy() {
        this.dispose();
        this.quillSubscription?.unsubscribe();
        this.quillSubscription = null;
    }
    ngOnChanges(changes) {
        if (!this.quillEditor) {
            return;
        }
        /* eslint-disable @typescript-eslint/dot-notation */
        if (changes.readOnly) {
            this.quillEditor.enable(!changes.readOnly.currentValue);
        }
        if (changes.placeholder) {
            this.quillEditor.root.dataset.placeholder =
                changes.placeholder.currentValue;
        }
        if (changes.defaultEmptyValue) {
            this.quillEditor.root.dataset.defaultEmptyValue =
                changes.defaultEmptyValue.currentValue;
        }
        if (changes.styles) {
            const currentStyling = changes.styles.currentValue;
            const previousStyling = changes.styles.previousValue;
            if (previousStyling) {
                Object.keys(previousStyling).forEach((key) => {
                    this.renderer.removeStyle(this.editorElem, key);
                });
            }
            if (currentStyling) {
                Object.keys(currentStyling).forEach((key) => {
                    this.renderer.setStyle(this.editorElem, key, this.styles[key]);
                });
            }
        }
        if (changes.classes) {
            const currentClasses = changes.classes.currentValue;
            const previousClasses = changes.classes.previousValue;
            if (previousClasses) {
                this.removeClasses(previousClasses);
            }
            if (currentClasses) {
                this.addClasses(currentClasses);
            }
        }
        // We'd want to re-apply event listeners if the `debounceTime` binding changes to apply the
        // `debounceTime` operator or vice-versa remove it.
        if (changes.debounceTime) {
            this.addQuillEventListeners();
        }
        /* eslint-enable @typescript-eslint/dot-notation */
    }
    addClasses(classList) {
        QuillEditorBase.normalizeClassNames(classList).forEach((c) => {
            this.renderer.addClass(this.editorElem, c);
        });
    }
    removeClasses(classList) {
        QuillEditorBase.normalizeClassNames(classList).forEach((c) => {
            this.renderer.removeClass(this.editorElem, c);
        });
    }
    writeValue(currentValue) {
        // optional fix for https://github.com/angular/angular/issues/14988
        if (this.filterNull && currentValue === null) {
            return;
        }
        this.content = currentValue;
        if (!this.quillEditor) {
            return;
        }
        const format = getFormat(this.format, this.service.config.format);
        const newValue = this.valueSetter(this.quillEditor, currentValue);
        if (this.compareValues) {
            const currentEditorValue = this.quillEditor.getContents();
            if (JSON.stringify(currentEditorValue) === JSON.stringify(newValue)) {
                return;
            }
        }
        if (currentValue) {
            if (format === 'text') {
                this.quillEditor.setText(currentValue);
            }
            else {
                this.quillEditor.setContents(newValue);
            }
            return;
        }
        this.quillEditor.setText('');
    }
    setDisabledState(isDisabled = this.disabled) {
        // store initial value to set appropriate disabled status after ViewInit
        this.disabled = isDisabled;
        if (this.quillEditor) {
            if (isDisabled) {
                this.quillEditor.disable();
                this.renderer.setAttribute(this.elementRef.nativeElement, 'disabled', 'disabled');
            }
            else {
                if (!this.readOnly) {
                    this.quillEditor.enable();
                }
                this.renderer.removeAttribute(this.elementRef.nativeElement, 'disabled');
            }
        }
    }
    registerOnChange(fn) {
        this.onModelChange = fn;
    }
    registerOnTouched(fn) {
        this.onModelTouched = fn;
    }
    registerOnValidatorChange(fn) {
        this.onValidatorChanged = fn;
    }
    validate() {
        if (!this.quillEditor) {
            return null;
        }
        const err = {};
        let valid = true;
        const text = this.quillEditor.getText();
        // trim text if wanted + handle special case that an empty editor contains a new line
        const textLength = this.trimOnValidation ? text.trim().length : (text.length === 1 && text.trim().length === 0 ? 0 : text.length - 1);
        const deltaOperations = this.quillEditor.getContents().ops;
        const onlyEmptyOperation = deltaOperations && deltaOperations.length === 1 && ['\n', ''].includes(deltaOperations[0].insert);
        if (this.minLength && textLength && textLength < this.minLength) {
            err.minLengthError = {
                given: textLength,
                minLength: this.minLength
            };
            valid = false;
        }
        if (this.maxLength && textLength > this.maxLength) {
            err.maxLengthError = {
                given: textLength,
                maxLength: this.maxLength
            };
            valid = false;
        }
        if (this.required && !textLength && onlyEmptyOperation) {
            err.requiredError = {
                empty: true
            };
            valid = false;
        }
        return valid ? null : err;
    }
    addQuillEventListeners() {
        this.dispose();
        // We have to enter the `<root>` zone when adding event listeners, so `debounceTime` will spawn the
        // `AsyncAction` there w/o triggering change detections. We still re-enter the Angular's zone through
        // `zone.run` when we emit an event to the parent component.
        this.zone.runOutsideAngular(() => {
            this.subscription = new Subscription();
            this.subscription.add(
            // mark model as touched if editor lost focus
            fromEvent(this.quillEditor, 'selection-change').subscribe(([range, oldRange, source]) => {
                this.selectionChangeHandler(range, oldRange, source);
            }));
            // The `fromEvent` supports passing JQuery-style event targets, the editor has `on` and `off` methods which
            // will be invoked upon subscription and teardown.
            let textChange$ = fromEvent(this.quillEditor, 'text-change');
            let editorChange$ = fromEvent(this.quillEditor, 'editor-change');
            if (typeof this.debounceTime === 'number') {
                textChange$ = textChange$.pipe(debounceTime(this.debounceTime));
                editorChange$ = editorChange$.pipe(debounceTime(this.debounceTime));
            }
            this.subscription.add(
            // update model if text changes
            textChange$.subscribe(([delta, oldDelta, source]) => {
                this.textChangeHandler(delta, oldDelta, source);
            }));
            this.subscription.add(
            // triggered if selection or text changed
            editorChange$.subscribe(([event, current, old, source]) => {
                this.editorChangeHandler(event, current, old, source);
            }));
        });
    }
    dispose() {
        if (this.subscription !== null) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}
QuillEditorBase.ɵfac = function QuillEditorBase_Factory(t) { return new (t || QuillEditorBase)(i0.ɵɵdirectiveInject(i0.Injector), i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.ChangeDetectorRef), i0.ɵɵdirectiveInject(i1.DomSanitizer), i0.ɵɵdirectiveInject(PLATFORM_ID), i0.ɵɵdirectiveInject(i0.Renderer2), i0.ɵɵdirectiveInject(i0.NgZone), i0.ɵɵdirectiveInject(i2.QuillService)); };
QuillEditorBase.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: QuillEditorBase, inputs: { format: "format", theme: "theme", modules: "modules", debug: "debug", readOnly: "readOnly", placeholder: "placeholder", maxLength: "maxLength", minLength: "minLength", required: "required", formats: "formats", customToolbarPosition: "customToolbarPosition", sanitize: "sanitize", styles: "styles", strict: "strict", scrollingContainer: "scrollingContainer", bounds: "bounds", customOptions: "customOptions", customModules: "customModules", trackChanges: "trackChanges", preserveWhitespace: "preserveWhitespace", classes: "classes", trimOnValidation: "trimOnValidation", linkPlaceholder: "linkPlaceholder", compareValues: "compareValues", filterNull: "filterNull", debounceTime: "debounceTime", defaultEmptyValue: "defaultEmptyValue", valueGetter: "valueGetter", valueSetter: "valueSetter" }, outputs: { onEditorCreated: "onEditorCreated", onEditorChanged: "onEditorChanged", onContentChanged: "onContentChanged", onSelectionChanged: "onSelectionChanged", onFocus: "onFocus", onBlur: "onBlur" }, features: [i0.ɵɵNgOnChangesFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(QuillEditorBase, [{
        type: Directive
    }], function () { return [{ type: i0.Injector }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.DomSanitizer }, { type: undefined, decorators: [{
                type: Inject,
                args: [PLATFORM_ID]
            }] }, { type: i0.Renderer2 }, { type: i0.NgZone }, { type: i2.QuillService }]; }, { format: [{
            type: Input
        }], theme: [{
            type: Input
        }], modules: [{
            type: Input
        }], debug: [{
            type: Input
        }], readOnly: [{
            type: Input
        }], placeholder: [{
            type: Input
        }], maxLength: [{
            type: Input
        }], minLength: [{
            type: Input
        }], required: [{
            type: Input
        }], formats: [{
            type: Input
        }], customToolbarPosition: [{
            type: Input
        }], sanitize: [{
            type: Input
        }], styles: [{
            type: Input
        }], strict: [{
            type: Input
        }], scrollingContainer: [{
            type: Input
        }], bounds: [{
            type: Input
        }], customOptions: [{
            type: Input
        }], customModules: [{
            type: Input
        }], trackChanges: [{
            type: Input
        }], preserveWhitespace: [{
            type: Input
        }], classes: [{
            type: Input
        }], trimOnValidation: [{
            type: Input
        }], linkPlaceholder: [{
            type: Input
        }], compareValues: [{
            type: Input
        }], filterNull: [{
            type: Input
        }], debounceTime: [{
            type: Input
        }], defaultEmptyValue: [{
            type: Input
        }], onEditorCreated: [{
            type: Output
        }], onEditorChanged: [{
            type: Output
        }], onContentChanged: [{
            type: Output
        }], onSelectionChanged: [{
            type: Output
        }], onFocus: [{
            type: Output
        }], onBlur: [{
            type: Output
        }], valueGetter: [{
            type: Input
        }], valueSetter: [{
            type: Input
        }] }); })();
export class QuillEditorComponent extends QuillEditorBase {
    constructor(injector, elementRef, cd, domSanitizer, platformId, renderer, zone, service) {
        super(injector, elementRef, cd, domSanitizer, platformId, renderer, zone, service);
    }
}
QuillEditorComponent.ɵfac = function QuillEditorComponent_Factory(t) { return new (t || QuillEditorComponent)(i0.ɵɵdirectiveInject(i0.Injector), i0.ɵɵdirectiveInject(ElementRef), i0.ɵɵdirectiveInject(ChangeDetectorRef), i0.ɵɵdirectiveInject(DomSanitizer), i0.ɵɵdirectiveInject(PLATFORM_ID), i0.ɵɵdirectiveInject(Renderer2), i0.ɵɵdirectiveInject(NgZone), i0.ɵɵdirectiveInject(QuillService)); };
QuillEditorComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: QuillEditorComponent, selectors: [["quill-editor"]], features: [i0.ɵɵProvidersFeature([
            {
                multi: true,
                provide: NG_VALUE_ACCESSOR,
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                useExisting: forwardRef(() => QuillEditorComponent)
            },
            {
                multi: true,
                provide: NG_VALIDATORS,
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                useExisting: forwardRef(() => QuillEditorComponent)
            }
        ]), i0.ɵɵInheritDefinitionFeature], ngContentSelectors: _c1, decls: 1, vars: 0, template: function QuillEditorComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵprojection(0);
    } }, styles: [":host{display:inline-block}\n"], encapsulation: 2 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(QuillEditorComponent, [{
        type: Component,
        args: [{
                encapsulation: ViewEncapsulation.None,
                providers: [
                    {
                        multi: true,
                        provide: NG_VALUE_ACCESSOR,
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        useExisting: forwardRef(() => QuillEditorComponent)
                    },
                    {
                        multi: true,
                        provide: NG_VALIDATORS,
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        useExisting: forwardRef(() => QuillEditorComponent)
                    }
                ],
                selector: 'quill-editor',
                template: `
  <ng-content select="[quill-editor-toolbar]"></ng-content>
`,
                styles: [
                    `
    :host {
      display: inline-block;
    }
    `
                ]
            }]
    }], function () { return [{ type: i0.Injector }, { type: i0.ElementRef, decorators: [{
                type: Inject,
                args: [ElementRef]
            }] }, { type: i0.ChangeDetectorRef, decorators: [{
                type: Inject,
                args: [ChangeDetectorRef]
            }] }, { type: i1.DomSanitizer, decorators: [{
                type: Inject,
                args: [DomSanitizer]
            }] }, { type: undefined, decorators: [{
                type: Inject,
                args: [PLATFORM_ID]
            }] }, { type: i0.Renderer2, decorators: [{
                type: Inject,
                args: [Renderer2]
            }] }, { type: i0.NgZone, decorators: [{
                type: Inject,
                args: [NgZone]
            }] }, { type: i2.QuillService, decorators: [{
                type: Inject,
                args: [QuillService]
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpbGwtZWRpdG9yLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1xdWlsbC9zcmMvbGliL3F1aWxsLWVkaXRvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzVELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQU14RCxPQUFPLEVBRUwsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsTUFBTSxFQUVOLEtBQUssRUFDTCxNQUFNLEVBR04sTUFBTSxFQUNOLFdBQVcsRUFDWCxTQUFTLEVBQ1QsZUFBZSxFQUVmLGlCQUFpQixFQUNsQixNQUFNLGVBQWUsQ0FBQTtBQUN0QixPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUM5QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFFN0MsT0FBTyxFQUF3QixhQUFhLEVBQUUsaUJBQWlCLEVBQWEsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsRyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFFakQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUE7Ozs7OztBQXNDOUMsa0VBQWtFO0FBQ2xFLE1BQU0sT0FBZ0IsZUFBZTtJQThEbkMsWUFDRSxRQUFrQixFQUNYLFVBQXNCLEVBQ25CLEVBQXFCLEVBQ3JCLFlBQTBCLEVBQ0wsVUFBZSxFQUNwQyxRQUFtQixFQUNuQixJQUFZLEVBQ1osT0FBcUI7UUFOeEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUNuQixPQUFFLEdBQUYsRUFB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V0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQzthQUNwRDtZQUNEO2dCQUNFLEtBQUssRUFBRSxJQUFJO2dCQUNYLE9BQU8sRUFBRSxhQUFhO2dCQUN0QixtRUFBbUU7Z0JBQ25FLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsb0JBQW9CLENBQUM7YUFDcEQ7U0FDRjs7UUFHRCxrQkFBeUQ7O3VGQVU5QyxvQkFBb0I7Y0E1QmhDLFNBQVM7ZUFBQztnQkFDVCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtnQkFDckMsU0FBUyxFQUFFO29CQUNUO3dCQUNFLEtBQUssRUFBRSxJQUFJO3dCQUNYLE9BQU8sRUFBRSxpQkFBaUI7d0JBQzFCLG1FQUFtRTt3QkFDbkUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUscUJBQXFCLENBQUM7cUJBQ3BEO29CQUNEO3dCQUNFLEtBQUssRUFBRSxJQUFJO3dCQUNYLE9BQU8sRUFBRSxhQUFhO3dCQUN0QixtRUFBbUU7d0JBQ25FLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDO3FCQUNwRDtpQkFDRjtnQkFDRCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsUUFBUSxFQUFFOztDQUVYO2dCQUNDLE1BQU0sRUFBRTtvQkFDTjs7OztLQUlDO2lCQUNGO2FBQ0Y7O3NCQUtJLE1BQU07dUJBQUMsVUFBVTs7c0JBQ2pCLE1BQU07dUJBQUMsaUJBQWlCOztzQkFDeEIsTUFBTTt1QkFBQyxZQUFZOztzQkFDbkIsTUFBTTt1QkFBQyxXQUFXOztzQkFDbEIsTUFBTTt1QkFBQyxTQUFTOztzQkFDaEIsTUFBTTt1QkFBQyxNQUFNOztzQkFDYixNQUFNO3VCQUFDLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBET0NVTUVOVCwgaXNQbGF0Zm9ybVNlcnZlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbidcbmltcG9ydCB7IERvbVNhbml0aXplciB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInXG5cbmltcG9ydCB7IFF1aWxsTW9kdWxlcywgQ3VzdG9tT3B0aW9uLCBDdXN0b21Nb2R1bGUgfSBmcm9tICcuL3F1aWxsLWVkaXRvci5pbnRlcmZhY2VzJ1xuXG5pbXBvcnQgUXVpbGxUeXBlLCB7IERlbHRhIH0gZnJvbSAncXVpbGwyJ1xuXG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgZm9yd2FyZFJlZixcbiAgSW5qZWN0LFxuICBJbmplY3RvcixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE91dHB1dCxcbiAgUExBVEZPUk1fSUQsXG4gIFJlbmRlcmVyMixcbiAgU2VjdXJpdHlDb250ZXh0LFxuICBTaW1wbGVDaGFuZ2VzLFxuICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJ1xuaW1wb3J0IHsgZnJvbUV2ZW50LCBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJ1xuaW1wb3J0IHsgZGVib3VuY2VUaW1lIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnXG5cbmltcG9ydCB7IENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxJREFUT1JTLCBOR19WQUxVRV9BQ0NFU1NPUiwgVmFsaWRhdG9yIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnXG5pbXBvcnQgeyBkZWZhdWx0TW9kdWxlcyB9IGZyb20gJy4vcXVpbGwtZGVmYXVsdHMnXG5cbmltcG9ydCB7IGdldEZvcm1hdCB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCB7IFF1aWxsU2VydmljZSB9IGZyb20gJy4vcXVpbGwuc2VydmljZSdcblxuZXhwb3J0IGludGVyZmFjZSBSYW5nZSB7XG4gIGluZGV4OiBudW1iZXJcbiAgbGVuZ3RoOiBudW1iZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb250ZW50Q2hhbmdlIHtcbiAgY29udGVudDogYW55XG4gIGRlbHRhOiBEZWx0YVxuICBlZGl0b3I6IFF1aWxsVHlwZVxuICBodG1sOiBzdHJpbmcgfCBudWxsXG4gIG9sZERlbHRhOiBEZWx0YVxuICBzb3VyY2U6IHN0cmluZ1xuICB0ZXh0OiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTZWxlY3Rpb25DaGFuZ2Uge1xuICBlZGl0b3I6IFF1aWxsVHlwZVxuICBvbGRSYW5nZTogUmFuZ2UgfCBudWxsXG4gIHJhbmdlOiBSYW5nZSB8IG51bGxcbiAgc291cmNlOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCbHVyIHtcbiAgZWRpdG9yOiBRdWlsbFR5cGVcbiAgc291cmNlOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGb2N1cyB7XG4gIGVkaXRvcjogUXVpbGxUeXBlXG4gIHNvdXJjZTogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIEVkaXRvckNoYW5nZUNvbnRlbnQgPSBDb250ZW50Q2hhbmdlICYgeyBldmVudDogJ3RleHQtY2hhbmdlJyB9XG5leHBvcnQgdHlwZSBFZGl0b3JDaGFuZ2VTZWxlY3Rpb24gPSBTZWxlY3Rpb25DaGFuZ2UgJiB7IGV2ZW50OiAnc2VsZWN0aW9uLWNoYW5nZScgfVxuXG5ARGlyZWN0aXZlKClcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAYW5ndWxhci1lc2xpbnQvZGlyZWN0aXZlLWNsYXNzLXN1ZmZpeFxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFF1aWxsRWRpdG9yQmFzZSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgVmFsaWRhdG9yIHtcbiAgQElucHV0KCkgZm9ybWF0PzogJ29iamVjdCcgfCAnaHRtbCcgfCAndGV4dCcgfCAnanNvbidcbiAgQElucHV0KCkgdGhlbWU/OiBzdHJpbmdcbiAgQElucHV0KCkgbW9kdWxlcz86IFF1aWxsTW9kdWxlc1xuICBASW5wdXQoKSBkZWJ1Zz86ICd3YXJuJyB8ICdsb2cnIHwgJ2Vycm9yJyB8IGZhbHNlXG4gIEBJbnB1dCgpIHJlYWRPbmx5PzogYm9vbGVhblxuICBASW5wdXQoKSBwbGFjZWhvbGRlcj86IHN0cmluZ1xuICBASW5wdXQoKSBtYXhMZW5ndGg/OiBudW1iZXJcbiAgQElucHV0KCkgbWluTGVuZ3RoPzogbnVtYmVyXG4gIEBJbnB1dCgpIHJlcXVpcmVkID0gZmFsc2VcbiAgQElucHV0KCkgZm9ybWF0cz86IHN0cmluZ1tdIHwgbnVsbFxuICBASW5wdXQoKSBjdXN0b21Ub29sYmFyUG9zaXRpb246ICd0b3AnIHwgJ2JvdHRvbScgPSAndG9wJ1xuICBASW5wdXQoKSBzYW5pdGl6ZT86IGJvb2xlYW5cbiAgQElucHV0KCkgc3R5bGVzOiBhbnkgPSBudWxsXG4gIEBJbnB1dCgpIHN0cmljdCA9IHRydWVcbiAgQElucHV0KCkgc2Nyb2xsaW5nQ29udGFpbmVyPzogSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCBudWxsXG4gIEBJbnB1dCgpIGJvdW5kcz86IEhUTUxFbGVtZW50IHwgc3RyaW5nXG4gIEBJbnB1dCgpIGN1c3RvbU9wdGlvbnM6IEN1c3RvbU9wdGlvbltdID0gW11cbiAgQElucHV0KCkgY3VzdG9tTW9kdWxlczogQ3VzdG9tTW9kdWxlW10gPSBbXVxuICBASW5wdXQoKSB0cmFja0NoYW5nZXM/OiAndXNlcicgfCAnYWxsJ1xuICBASW5wdXQoKSBwcmVzZXJ2ZVdoaXRlc3BhY2UgPSBmYWxzZVxuICBASW5wdXQoKSBjbGFzc2VzPzogc3RyaW5nXG4gIEBJbnB1dCgpIHRyaW1PblZhbGlkYXRpb24gPSBmYWxzZVxuICBASW5wdXQoKSBsaW5rUGxhY2Vob2xkZXI/OiBzdHJpbmdcbiAgQElucHV0KCkgY29tcGFyZVZhbHVlcyA9IGZhbHNlXG4gIEBJbnB1dCgpIGZpbHRlck51bGwgPSBmYWxzZVxuICBASW5wdXQoKSBkZWJvdW5jZVRpbWU/OiBudW1iZXJcbiAgLypcbiAgaHR0cHM6Ly9naXRodWIuY29tL0tpbGxlckNvZGVNb25rZXkvbmd4LXF1aWxsL2lzc3Vlcy8xMjU3IC0gZml4IG51bGwgdmFsdWUgc2V0XG5cbiAgcHJvdmlkZSBkZWZhdWx0IGVtcHR5IHZhbHVlXG4gIGJ5IGRlZmF1bHQgbnVsbFxuXG4gIGUuZy4gZGVmYXVsdEVtcHR5VmFsdWU9XCJcIiAtIGVtcHR5IHN0cmluZ1xuXG4gIDxxdWlsbC1lZGl0b3JcbiAgICBkZWZhdWx0RW1wdHlWYWx1ZT1cIlwiXG4gICAgZm9ybUNvbnRyb2xOYW1lPVwibWVzc2FnZVwiXG4gID48L3F1aWxsLWVkaXRvcj5cbiAgKi9cbiAgQElucHV0KCkgZGVmYXVsdEVtcHR5VmFsdWU/OiBhbnkgPSBudWxsXG5cbiAgQE91dHB1dCgpIG9uRWRpdG9yQ3JlYXRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKClcbiAgQE91dHB1dCgpIG9uRWRpdG9yQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEVkaXRvckNoYW5nZUNvbnRlbnQgfCBFZGl0b3JDaGFuZ2VTZWxlY3Rpb24+ID0gbmV3IEV2ZW50RW1pdHRlcigpXG4gIEBPdXRwdXQoKSBvbkNvbnRlbnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29udGVudENoYW5nZT4gPSBuZXcgRXZlbnRFbWl0dGVyKClcbiAgQE91dHB1dCgpIG9uU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZT4gPSBuZXcgRXZlbnRFbWl0dGVyKClcbiAgQE91dHB1dCgpIG9uRm9jdXM6IEV2ZW50RW1pdHRlcjxGb2N1cz4gPSBuZXcgRXZlbnRFbWl0dGVyKClcbiAgQE91dHB1dCgpIG9uQmx1cjogRXZlbnRFbWl0dGVyPEJsdXI+ID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbiAgcXVpbGxFZGl0b3IhOiBRdWlsbFR5cGVcbiAgZWRpdG9yRWxlbSE6IEhUTUxFbGVtZW50XG4gIGNvbnRlbnQ6IGFueVxuICBkaXNhYmxlZCA9IGZhbHNlIC8vIHVzZWQgdG8gc3RvcmUgaW5pdGlhbCB2YWx1ZSBiZWZvcmUgVmlld0luaXRcblxuICBvbk1vZGVsQ2hhbmdlOiAobW9kZWxWYWx1ZT86IGFueSkgPT4gdm9pZFxuICBvbk1vZGVsVG91Y2hlZDogKCkgPT4gdm9pZFxuICBvblZhbGlkYXRvckNoYW5nZWQ6ICgpID0+IHZvaWRcblxuICBwcml2YXRlIGRvY3VtZW50OiBEb2N1bWVudFxuICBwcml2YXRlIHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgbnVsbCA9IG51bGxcbiAgcHJpdmF0ZSBxdWlsbFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgbnVsbCA9IG51bGxcblxuICBjb25zdHJ1Y3RvcihcbiAgICBpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgcHVibGljIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIGNkOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcm90ZWN0ZWQgZG9tU2FuaXRpemVyOiBEb21TYW5pdGl6ZXIsXG4gICAgQEluamVjdChQTEFURk9STV9JRCkgcHJvdGVjdGVkIHBsYXRmb3JtSWQ6IGFueSxcbiAgICBwcm90ZWN0ZWQgcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgICBwcm90ZWN0ZWQgem9uZTogTmdab25lLFxuICAgIHByb3RlY3RlZCBzZXJ2aWNlOiBRdWlsbFNlcnZpY2VcbiAgKSB7XG4gICAgdGhpcy5kb2N1bWVudCA9IGluamVjdG9yLmdldChET0NVTUVOVClcbiAgfVxuXG4gIHN0YXRpYyBub3JtYWxpemVDbGFzc05hbWVzKGNsYXNzZXM6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBjbGFzc0xpc3QgPSBjbGFzc2VzLnRyaW0oKS5zcGxpdCgnICcpXG4gICAgcmV0dXJuIGNsYXNzTGlzdC5yZWR1Y2UoKHByZXY6IHN0cmluZ1tdLCBjdXI6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgdHJpbW1lZCA9IGN1ci50cmltKClcbiAgICAgIGlmICh0cmltbWVkKSB7XG4gICAgICAgIHByZXYucHVzaCh0cmltbWVkKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldlxuICAgIH0sIFtdKVxuICB9XG5cbiAgQElucHV0KClcbiAgdmFsdWVHZXR0ZXIgPSAocXVpbGxFZGl0b3I6IFF1aWxsVHlwZSwgZWRpdG9yRWxlbWVudDogSFRNTEVsZW1lbnQpOiBzdHJpbmcgfCBhbnkgPT4ge1xuICAgIGxldCBodG1sOiBzdHJpbmcgfCBudWxsID0gZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcucWwtZWRpdG9yJykhLmlubmVySFRNTFxuICAgIGlmIChodG1sID09PSAnPHA+PGJyPjwvcD4nIHx8IGh0bWwgPT09ICc8ZGl2Pjxicj48L2Rpdj4nKSB7XG4gICAgICBodG1sID0gdGhpcy5kZWZhdWx0RW1wdHlWYWx1ZVxuICAgIH1cbiAgICBsZXQgbW9kZWxWYWx1ZTogc3RyaW5nIHwgRGVsdGEgfCBudWxsID0gaHRtbFxuICAgIGNvbnN0IGZvcm1hdCA9IGdldEZvcm1hdCh0aGlzLmZvcm1hdCwgdGhpcy5zZXJ2aWNlLmNvbmZpZy5mb3JtYXQpXG5cbiAgICBpZiAoZm9ybWF0ID09PSAndGV4dCcpIHtcbiAgICAgIG1vZGVsVmFsdWUgPSBxdWlsbEVkaXRvci5nZXRUZXh0KClcbiAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG1vZGVsVmFsdWUgPSBxdWlsbEVkaXRvci5nZXRDb250ZW50cygpXG4gICAgfSBlbHNlIGlmIChmb3JtYXQgPT09ICdqc29uJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbW9kZWxWYWx1ZSA9IEpTT04uc3RyaW5naWZ5KHF1aWxsRWRpdG9yLmdldENvbnRlbnRzKCkpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIG1vZGVsVmFsdWUgPSBxdWlsbEVkaXRvci5nZXRUZXh0KClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbW9kZWxWYWx1ZVxuICB9XG5cbiAgQElucHV0KClcbiAgdmFsdWVTZXR0ZXIgPSAocXVpbGxFZGl0b3I6IFF1aWxsVHlwZSwgdmFsdWU6IGFueSk6IGFueSA9PiB7XG4gICAgY29uc3QgZm9ybWF0ID0gZ2V0Rm9ybWF0KHRoaXMuZm9ybWF0LCB0aGlzLnNlcnZpY2UuY29uZmlnLmZvcm1hdClcbiAgICBpZiAoZm9ybWF0ID09PSAnaHRtbCcpIHtcbiAgICAgIGNvbnN0IHNhbml0aXplID0gW3RydWUsIGZhbHNlXS5pbmNsdWRlcyh0aGlzLnNhbml0aXplKSA/IHRoaXMuc2FuaXRpemUgOiAodGhpcy5zZXJ2aWNlLmNvbmZpZy5zYW5pdGl6ZSB8fCBmYWxzZSlcbiAgICAgIGlmIChzYW5pdGl6ZSkge1xuICAgICAgICB2YWx1ZSA9IHRoaXMuZG9tU2FuaXRpemVyLnNhbml0aXplKFNlY3VyaXR5Q29udGV4dC5IVE1MLCB2YWx1ZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBxdWlsbEVkaXRvci5jbGlwYm9hcmQuY29udmVydCh2YWx1ZSlcbiAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gJ2pzb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIFt7IGluc2VydDogdmFsdWUgfV1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICBpZiAoaXNQbGF0Zm9ybVNlcnZlcih0aGlzLnBsYXRmb3JtSWQpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBUaGUgYHF1aWxsLWVkaXRvcmAgY29tcG9uZW50IG1pZ2h0IGJlIGRlc3Ryb3llZCBiZWZvcmUgdGhlIGBxdWlsbGAgY2h1bmsgaXMgbG9hZGVkIGFuZCBpdHMgY29kZSBpcyBleGVjdXRlZFxuICAgIC8vIHRoaXMgd2lsbCBsZWFkIHRvIHJ1bnRpbWUgZXhjZXB0aW9ucywgc2luY2UgdGhlIGNvZGUgd2lsbCBiZSBleGVjdXRlZCBvbiBET00gbm9kZXMgdGhhdCBkb24ndCBleGlzdCB3aXRoaW4gdGhlIHRyZWUuXG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG4gICAgdGhpcy5xdWlsbFN1YnNjcmlwdGlvbiA9IHRoaXMuc2VydmljZS5nZXRRdWlsbCgpLnN1YnNjcmliZShRdWlsbCA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgIHRoaXMuY3VzdG9tVG9vbGJhclBvc2l0aW9uID09PSAndG9wJyA/ICdiZWZvcmVlbmQnIDogJ2FmdGVyYmVnaW4nLFxuICAgICAgICB0aGlzLnByZXNlcnZlV2hpdGVzcGFjZSA/ICc8cHJlIHF1aWxsLWVkaXRvci1lbGVtZW50PjwvcHJlPicgOiAnPGRpdiBxdWlsbC1lZGl0b3ItZWxlbWVudD48L2Rpdj4nXG4gICAgICApXG5cbiAgICAgIHRoaXMuZWRpdG9yRWxlbSA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICdbcXVpbGwtZWRpdG9yLWVsZW1lbnRdJ1xuICAgICAgKVxuXG4gICAgICBjb25zdCB0b29sYmFyRWxlbSA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICdbcXVpbGwtZWRpdG9yLXRvb2xiYXJdJ1xuICAgICAgKVxuICAgICAgY29uc3QgbW9kdWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMubW9kdWxlcyB8fCB0aGlzLnNlcnZpY2UuY29uZmlnLm1vZHVsZXMpXG5cbiAgICAgIGlmICh0b29sYmFyRWxlbSkge1xuICAgICAgICBtb2R1bGVzLnRvb2xiYXIgPSB0b29sYmFyRWxlbVxuICAgICAgfSBlbHNlIGlmIChtb2R1bGVzLnRvb2xiYXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBtb2R1bGVzLnRvb2xiYXIgPSBkZWZhdWx0TW9kdWxlcy50b29sYmFyXG4gICAgICB9XG5cbiAgICAgIGxldCBwbGFjZWhvbGRlciA9IHRoaXMucGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCA/IHRoaXMucGxhY2Vob2xkZXIgOiB0aGlzLnNlcnZpY2UuY29uZmlnLnBsYWNlaG9sZGVyXG4gICAgICBpZiAocGxhY2Vob2xkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwbGFjZWhvbGRlciA9ICdJbnNlcnQgdGV4dCBoZXJlIC4uLidcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc3R5bGVzKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuc3R5bGVzKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lZGl0b3JFbGVtLCBrZXksIHRoaXMuc3R5bGVzW2tleV0pXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNsYXNzZXMpIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzc2VzKHRoaXMuY2xhc3NlcylcbiAgICAgIH1cblxuICAgICAgdGhpcy5jdXN0b21PcHRpb25zLmZvckVhY2goKGN1c3RvbU9wdGlvbikgPT4ge1xuICAgICAgICBjb25zdCBuZXdDdXN0b21PcHRpb24gPSBRdWlsbC5pbXBvcnQoY3VzdG9tT3B0aW9uLmltcG9ydClcbiAgICAgICAgbmV3Q3VzdG9tT3B0aW9uLndoaXRlbGlzdCA9IGN1c3RvbU9wdGlvbi53aGl0ZWxpc3RcbiAgICAgICAgUXVpbGwucmVnaXN0ZXIobmV3Q3VzdG9tT3B0aW9uLCB0cnVlKVxuICAgICAgfSlcblxuICAgICAgdGhpcy5jdXN0b21Nb2R1bGVzLmZvckVhY2goKHsgaW1wbGVtZW50YXRpb24sIHBhdGggfSkgPT4ge1xuICAgICAgICBRdWlsbC5yZWdpc3RlcihwYXRoLCBpbXBsZW1lbnRhdGlvbilcbiAgICAgIH0pXG5cbiAgICAgIGxldCBib3VuZHMgPSB0aGlzLmJvdW5kcyAmJiB0aGlzLmJvdW5kcyA9PT0gJ3NlbGYnID8gdGhpcy5lZGl0b3JFbGVtIDogdGhpcy5ib3VuZHNcbiAgICAgIGlmICghYm91bmRzKSB7XG4gICAgICAgIGJvdW5kcyA9IHRoaXMuc2VydmljZS5jb25maWcuYm91bmRzID8gdGhpcy5zZXJ2aWNlLmNvbmZpZy5ib3VuZHMgOiB0aGlzLmRvY3VtZW50LmJvZHlcbiAgICAgIH1cblxuICAgICAgbGV0IGRlYnVnID0gdGhpcy5kZWJ1Z1xuICAgICAgaWYgKCFkZWJ1ZyAmJiBkZWJ1ZyAhPT0gZmFsc2UgJiYgdGhpcy5zZXJ2aWNlLmNvbmZpZy5kZWJ1Zykge1xuICAgICAgICBkZWJ1ZyA9IHRoaXMuc2VydmljZS5jb25maWcuZGVidWdcbiAgICAgIH1cblxuICAgICAgbGV0IHJlYWRPbmx5ID0gdGhpcy5yZWFkT25seVxuICAgICAgaWYgKCFyZWFkT25seSAmJiB0aGlzLnJlYWRPbmx5ICE9PSBmYWxzZSkge1xuICAgICAgICByZWFkT25seSA9IHRoaXMuc2VydmljZS5jb25maWcucmVhZE9ubHkgIT09IHVuZGVmaW5lZCA/IHRoaXMuc2VydmljZS5jb25maWcucmVhZE9ubHkgOiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBsZXQgZGVmYXVsdEVtcHR5VmFsdWUgPSB0aGlzLmRlZmF1bHRFbXB0eVZhbHVlXG4gICAgICBpZiAodGhpcy5zZXJ2aWNlLmNvbmZpZy5oYXNPd25Qcm9wZXJ0eSgnZGVmYXVsdEVtcHR5VmFsdWUnKSkge1xuICAgICAgICBkZWZhdWx0RW1wdHlWYWx1ZSA9IHRoaXMuc2VydmljZS5jb25maWcuZGVmYXVsdEVtcHR5VmFsdWVcbiAgICAgIH1cblxuICAgICAgbGV0IHNjcm9sbGluZ0NvbnRhaW5lciA9IHRoaXMuc2Nyb2xsaW5nQ29udGFpbmVyXG4gICAgICBpZiAoIXNjcm9sbGluZ0NvbnRhaW5lciAmJiB0aGlzLnNjcm9sbGluZ0NvbnRhaW5lciAhPT0gbnVsbCkge1xuICAgICAgICBzY3JvbGxpbmdDb250YWluZXIgPVxuICAgICAgICAgIHRoaXMuc2VydmljZS5jb25maWcuc2Nyb2xsaW5nQ29udGFpbmVyID09PSBudWxsXG4gICAgICAgICAgICB8fCB0aGlzLnNlcnZpY2UuY29uZmlnLnNjcm9sbGluZ0NvbnRhaW5lciA/IHRoaXMuc2VydmljZS5jb25maWcuc2Nyb2xsaW5nQ29udGFpbmVyIDogbnVsbFxuICAgICAgfVxuXG4gICAgICBsZXQgZm9ybWF0cyA9IHRoaXMuZm9ybWF0c1xuICAgICAgaWYgKCFmb3JtYXRzICYmIGZvcm1hdHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBmb3JtYXRzID0gdGhpcy5zZXJ2aWNlLmNvbmZpZy5mb3JtYXRzID8gWy4uLnRoaXMuc2VydmljZS5jb25maWcuZm9ybWF0c10gOiAodGhpcy5zZXJ2aWNlLmNvbmZpZy5mb3JtYXRzID09PSBudWxsID8gbnVsbCA6IHVuZGVmaW5lZClcbiAgICAgIH1cblxuICAgICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgdGhpcy5xdWlsbEVkaXRvciA9IG5ldyBRdWlsbCh0aGlzLmVkaXRvckVsZW0sIHtcbiAgICAgICAgICBib3VuZHMsXG4gICAgICAgICAgZGVidWc6IGRlYnVnIGFzIGFueSxcbiAgICAgICAgICBmb3JtYXRzOiBmb3JtYXRzIGFzIGFueSxcbiAgICAgICAgICBtb2R1bGVzLFxuICAgICAgICAgIHBsYWNlaG9sZGVyLFxuICAgICAgICAgIHJlYWRPbmx5LFxuICAgICAgICAgIGRlZmF1bHRFbXB0eVZhbHVlLFxuICAgICAgICAgIHNjcm9sbGluZ0NvbnRhaW5lcjogc2Nyb2xsaW5nQ29udGFpbmVyIGFzIGFueSxcbiAgICAgICAgICBzdHJpY3Q6IHRoaXMuc3RyaWN0LFxuICAgICAgICAgIHRoZW1lOiB0aGlzLnRoZW1lIHx8ICh0aGlzLnNlcnZpY2UuY29uZmlnLnRoZW1lID8gdGhpcy5zZXJ2aWNlLmNvbmZpZy50aGVtZSA6ICdzbm93JylcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBTZXQgb3B0aW9uYWwgbGluayBwbGFjZWhvbGRlciwgUXVpbGwgaGFzIG5vIG5hdGl2ZSBBUEkgZm9yIGl0IHNvIHVzaW5nIHdvcmthcm91bmRcbiAgICAgICAgaWYgKHRoaXMubGlua1BsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgY29uc3QgdG9vbHRpcCA9ICh0aGlzLnF1aWxsRWRpdG9yIGFzIGFueSk/LnRoZW1lPy50b29sdGlwXG4gICAgICAgICAgY29uc3QgaW5wdXQgPSB0b29sdGlwPy5yb290Py5xdWVyeVNlbGVjdG9yKCdpbnB1dFtkYXRhLWxpbmtdJylcbiAgICAgICAgICBpZiAoaW5wdXQ/LmRhdGFzZXQpIHtcbiAgICAgICAgICAgIGlucHV0LmRhdGFzZXQubGluayA9IHRoaXMubGlua1BsYWNlaG9sZGVyXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBpZiAodGhpcy5jb250ZW50KSB7XG4gICAgICAgIGNvbnN0IGZvcm1hdCA9IGdldEZvcm1hdCh0aGlzLmZvcm1hdCwgdGhpcy5zZXJ2aWNlLmNvbmZpZy5mb3JtYXQpXG5cbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgdGhpcy5xdWlsbEVkaXRvci5zZXRUZXh0KHRoaXMuY29udGVudCwgJ3NpbGVudCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLnZhbHVlU2V0dGVyKHRoaXMucXVpbGxFZGl0b3IsIHRoaXMuY29udGVudClcbiAgICAgICAgICB0aGlzLnF1aWxsRWRpdG9yLnNldENvbnRlbnRzKG5ld1ZhbHVlLCAnc2lsZW50JylcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucXVpbGxFZGl0b3IuZ2V0TW9kdWxlKCdoaXN0b3J5JykuY2xlYXIoKVxuICAgICAgfVxuXG4gICAgICAvLyBpbml0aWFsaXplIGRpc2FibGVkIHN0YXR1cyBiYXNlZCBvbiB0aGlzLmRpc2FibGVkIGFzIGRlZmF1bHQgdmFsdWVcbiAgICAgIHRoaXMuc2V0RGlzYWJsZWRTdGF0ZSgpXG5cbiAgICAgIHRoaXMuYWRkUXVpbGxFdmVudExpc3RlbmVycygpXG5cbiAgICAgIC8vIFRoZSBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCB0cmlnZ2VycyBjaGFuZ2UgZGV0ZWN0aW9uLiBUaGVyZSdzIG5vIHNlbnNlIHRvIGludm9rZSB0aGUgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgaWYgYW55b25lIGlzXG4gICAgICAvLyBsaXN0ZW5pbmcgdG8gdGhlIGBvbkVkaXRvckNyZWF0ZWRgIGV2ZW50IGluc2lkZSB0aGUgdGVtcGxhdGUsIGZvciBpbnN0YW5jZSBgPHF1aWxsLXZpZXcgKG9uRWRpdG9yQ3JlYXRlZCk9XCIuLi5cIj5gLlxuICAgICAgaWYgKCF0aGlzLm9uRWRpdG9yQ3JlYXRlZC5vYnNlcnZlcnMubGVuZ3RoICYmICF0aGlzLm9uVmFsaWRhdG9yQ2hhbmdlZCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIHdpbGwgdHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uIGFuZCBgb25FZGl0b3JDcmVhdGVkYCB3aWxsIGFsc28gY2FsbCBgbWFya0RpcnR5KClgXG4gICAgICAvLyBpbnRlcm5hbGx5LCBzaW5jZSBBbmd1bGFyIHdyYXBzIHRlbXBsYXRlIGV2ZW50IGxpc3RlbmVycyBpbnRvIGBsaXN0ZW5lcmAgaW5zdHJ1Y3Rpb24uIFdlJ3JlIHVzaW5nIHRoZSBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYFxuICAgICAgLy8gdG8gcHJldmVudCB0aGUgZnJhbWUgZHJvcCBhbmQgYXZvaWQgYEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXJyb3JgIGVycm9yLlxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMub25WYWxpZGF0b3JDaGFuZ2VkKSB7XG4gICAgICAgICAgdGhpcy5vblZhbGlkYXRvckNoYW5nZWQoKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMub25FZGl0b3JDcmVhdGVkLmVtaXQodGhpcy5xdWlsbEVkaXRvcilcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHNlbGVjdGlvbkNoYW5nZUhhbmRsZXIgPSAocmFuZ2U6IFJhbmdlIHwgbnVsbCwgb2xkUmFuZ2U6IFJhbmdlIHwgbnVsbCwgc291cmNlOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBzaG91bGRUcmlnZ2VyT25Nb2RlbFRvdWNoZWQgPSAhcmFuZ2UgJiYgISF0aGlzLm9uTW9kZWxUb3VjaGVkXG5cbiAgICAvLyBvbmx5IGVtaXQgY2hhbmdlcyB3aGVuIHRoZXJlJ3MgYW55IGxpc3RlbmVyXG4gICAgaWYgKCF0aGlzLm9uQmx1ci5vYnNlcnZlcnMubGVuZ3RoICYmXG4gICAgICAhdGhpcy5vbkZvY3VzLm9ic2VydmVycy5sZW5ndGggJiZcbiAgICAgICF0aGlzLm9uU2VsZWN0aW9uQ2hhbmdlZC5vYnNlcnZlcnMubGVuZ3RoICYmXG4gICAgICAhc2hvdWxkVHJpZ2dlck9uTW9kZWxUb3VjaGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAgIGlmIChyYW5nZSA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLm9uQmx1ci5lbWl0KHtcbiAgICAgICAgICBlZGl0b3I6IHRoaXMucXVpbGxFZGl0b3IsXG4gICAgICAgICAgc291cmNlXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2UgaWYgKG9sZFJhbmdlID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMub25Gb2N1cy5lbWl0KHtcbiAgICAgICAgICBlZGl0b3I6IHRoaXMucXVpbGxFZGl0b3IsXG4gICAgICAgICAgc291cmNlXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHRoaXMub25TZWxlY3Rpb25DaGFuZ2VkLmVtaXQoe1xuICAgICAgICBlZGl0b3I6IHRoaXMucXVpbGxFZGl0b3IsXG4gICAgICAgIG9sZFJhbmdlLFxuICAgICAgICByYW5nZSxcbiAgICAgICAgc291cmNlXG4gICAgICB9KVxuXG4gICAgICBpZiAoc2hvdWxkVHJpZ2dlck9uTW9kZWxUb3VjaGVkKSB7XG4gICAgICAgIHRoaXMub25Nb2RlbFRvdWNoZWQoKVxuICAgICAgfVxuXG4gICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpXG4gICAgfSlcbiAgfVxuXG4gIHRleHRDaGFuZ2VIYW5kbGVyID0gKGRlbHRhOiBEZWx0YSwgb2xkRGVsdGE6IERlbHRhLCBzb3VyY2U6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIC8vIG9ubHkgZW1pdCBjaGFuZ2VzIGVtaXR0ZWQgYnkgdXNlciBpbnRlcmFjdGlvbnNcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5xdWlsbEVkaXRvci5nZXRUZXh0KClcbiAgICBjb25zdCBjb250ZW50ID0gdGhpcy5xdWlsbEVkaXRvci5nZXRDb250ZW50cygpXG5cbiAgICBsZXQgaHRtbDogc3RyaW5nIHwgbnVsbCA9IHRoaXMuZWRpdG9yRWxlbSEucXVlcnlTZWxlY3RvcignLnFsLWVkaXRvcicpIS5pbm5lckhUTUxcbiAgICBpZiAoaHRtbCA9PT0gJzxwPjxicj48L3A+JyB8fCBodG1sID09PSAnPGRpdj48YnI+PC9kaXY+Jykge1xuICAgICAgaHRtbCA9IHRoaXMuZGVmYXVsdEVtcHR5VmFsdWVcbiAgICB9XG5cbiAgICBjb25zdCB0cmFja0NoYW5nZXMgPSB0aGlzLnRyYWNrQ2hhbmdlcyB8fCB0aGlzLnNlcnZpY2UuY29uZmlnLnRyYWNrQ2hhbmdlc1xuICAgIGNvbnN0IHNob3VsZFRyaWdnZXJPbk1vZGVsQ2hhbmdlID0gKHNvdXJjZSA9PT0gJ3VzZXInIHx8IHRyYWNrQ2hhbmdlcyAmJiB0cmFja0NoYW5nZXMgPT09ICdhbGwnKSAmJiAhIXRoaXMub25Nb2RlbENoYW5nZVxuXG4gICAgLy8gb25seSBlbWl0IGNoYW5nZXMgd2hlbiB0aGVyZSdzIGFueSBsaXN0ZW5lclxuICAgIGlmICghdGhpcy5vbkNvbnRlbnRDaGFuZ2VkLm9ic2VydmVycy5sZW5ndGggJiYgIXNob3VsZFRyaWdnZXJPbk1vZGVsQ2hhbmdlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAgIGlmIChzaG91bGRUcmlnZ2VyT25Nb2RlbENoYW5nZSkge1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UoXG4gICAgICAgICAgdGhpcy52YWx1ZUdldHRlcih0aGlzLnF1aWxsRWRpdG9yLCB0aGlzLmVkaXRvckVsZW0hKVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHRoaXMub25Db250ZW50Q2hhbmdlZC5lbWl0KHtcbiAgICAgICAgY29udGVudCxcbiAgICAgICAgZGVsdGEsXG4gICAgICAgIGVkaXRvcjogdGhpcy5xdWlsbEVkaXRvcixcbiAgICAgICAgaHRtbCxcbiAgICAgICAgb2xkRGVsdGEsXG4gICAgICAgIHNvdXJjZSxcbiAgICAgICAgdGV4dFxuICAgICAgfSlcblxuICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKVxuICAgIH0pXG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxlblxuICBlZGl0b3JDaGFuZ2VIYW5kbGVyID0gKFxuICAgIGV2ZW50OiAndGV4dC1jaGFuZ2UnIHwgJ3NlbGVjdGlvbi1jaGFuZ2UnLFxuICAgIGN1cnJlbnQ6IGFueSB8IFJhbmdlIHwgbnVsbCwgb2xkOiBhbnkgfCBSYW5nZSB8IG51bGwsIHNvdXJjZTogc3RyaW5nXG4gICk6IHZvaWQgPT4ge1xuICAgIC8vIG9ubHkgZW1pdCBjaGFuZ2VzIHdoZW4gdGhlcmUncyBhbnkgbGlzdGVuZXJcbiAgICBpZiAoIXRoaXMub25FZGl0b3JDaGFuZ2VkLm9ic2VydmVycy5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIG9ubHkgZW1pdCBjaGFuZ2VzIGVtaXR0ZWQgYnkgdXNlciBpbnRlcmFjdGlvbnNcbiAgICBpZiAoZXZlbnQgPT09ICd0ZXh0LWNoYW5nZScpIHtcbiAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnF1aWxsRWRpdG9yLmdldFRleHQoKVxuICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucXVpbGxFZGl0b3IuZ2V0Q29udGVudHMoKVxuXG4gICAgICBsZXQgaHRtbDogc3RyaW5nIHwgbnVsbCA9IHRoaXMuZWRpdG9yRWxlbSEucXVlcnlTZWxlY3RvcignLnFsLWVkaXRvcicpIS5pbm5lckhUTUxcbiAgICAgIGlmIChodG1sID09PSAnPHA+PGJyPjwvcD4nIHx8IGh0bWwgPT09ICc8ZGl2Pjxicj48L2Rpdj4nKSB7XG4gICAgICAgIGh0bWwgPSB0aGlzLmRlZmF1bHRFbXB0eVZhbHVlXG4gICAgICB9XG5cbiAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICB0aGlzLm9uRWRpdG9yQ2hhbmdlZC5lbWl0KHtcbiAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgIGRlbHRhOiBjdXJyZW50LFxuICAgICAgICAgIGVkaXRvcjogdGhpcy5xdWlsbEVkaXRvcixcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgICBodG1sLFxuICAgICAgICAgIG9sZERlbHRhOiBvbGQsXG4gICAgICAgICAgc291cmNlLFxuICAgICAgICAgIHRleHRcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5vbkVkaXRvckNoYW5nZWQuZW1pdCh7XG4gICAgICAgICAgZWRpdG9yOiB0aGlzLnF1aWxsRWRpdG9yLFxuICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgIG9sZFJhbmdlOiBvbGQsXG4gICAgICAgICAgcmFuZ2U6IGN1cnJlbnQsXG4gICAgICAgICAgc291cmNlXG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmRpc3Bvc2UoKVxuXG4gICAgdGhpcy5xdWlsbFN1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKVxuICAgIHRoaXMucXVpbGxTdWJzY3JpcHRpb24gPSBudWxsXG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnF1aWxsRWRpdG9yKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2RvdC1ub3RhdGlvbiAqL1xuICAgIGlmIChjaGFuZ2VzLnJlYWRPbmx5KSB7XG4gICAgICB0aGlzLnF1aWxsRWRpdG9yLmVuYWJsZSghY2hhbmdlcy5yZWFkT25seS5jdXJyZW50VmFsdWUpXG4gICAgfVxuICAgIGlmIChjaGFuZ2VzLnBsYWNlaG9sZGVyKSB7XG4gICAgICB0aGlzLnF1aWxsRWRpdG9yLnJvb3QuZGF0YXNldC5wbGFjZWhvbGRlciA9XG4gICAgICAgIGNoYW5nZXMucGxhY2Vob2xkZXIuY3VycmVudFZhbHVlXG4gICAgfVxuICAgIGlmIChjaGFuZ2VzLmRlZmF1bHRFbXB0eVZhbHVlKSB7XG4gICAgICB0aGlzLnF1aWxsRWRpdG9yLnJvb3QuZGF0YXNldC5kZWZhdWx0RW1wdHlWYWx1ZSA9XG4gICAgICAgIGNoYW5nZXMuZGVmYXVsdEVtcHR5VmFsdWUuY3VycmVudFZhbHVlXG4gICAgfVxuICAgIGlmIChjaGFuZ2VzLnN0eWxlcykge1xuICAgICAgY29uc3QgY3VycmVudFN0eWxpbmcgPSBjaGFuZ2VzLnN0eWxlcy5jdXJyZW50VmFsdWVcbiAgICAgIGNvbnN0IHByZXZpb3VzU3R5bGluZyA9IGNoYW5nZXMuc3R5bGVzLnByZXZpb3VzVmFsdWVcblxuICAgICAgaWYgKHByZXZpb3VzU3R5bGluZykge1xuICAgICAgICBPYmplY3Qua2V5cyhwcmV2aW91c1N0eWxpbmcpLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVTdHlsZSh0aGlzLmVkaXRvckVsZW0sIGtleSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmIChjdXJyZW50U3R5bGluZykge1xuICAgICAgICBPYmplY3Qua2V5cyhjdXJyZW50U3R5bGluZykuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZWRpdG9yRWxlbSwga2V5LCB0aGlzLnN0eWxlc1trZXldKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2hhbmdlcy5jbGFzc2VzKSB7XG4gICAgICBjb25zdCBjdXJyZW50Q2xhc3NlcyA9IGNoYW5nZXMuY2xhc3Nlcy5jdXJyZW50VmFsdWVcbiAgICAgIGNvbnN0IHByZXZpb3VzQ2xhc3NlcyA9IGNoYW5nZXMuY2xhc3Nlcy5wcmV2aW91c1ZhbHVlXG5cbiAgICAgIGlmIChwcmV2aW91c0NsYXNzZXMpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzc2VzKHByZXZpb3VzQ2xhc3NlcylcbiAgICAgIH1cblxuICAgICAgaWYgKGN1cnJlbnRDbGFzc2VzKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3NlcyhjdXJyZW50Q2xhc3NlcylcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gV2UnZCB3YW50IHRvIHJlLWFwcGx5IGV2ZW50IGxpc3RlbmVycyBpZiB0aGUgYGRlYm91bmNlVGltZWAgYmluZGluZyBjaGFuZ2VzIHRvIGFwcGx5IHRoZVxuICAgIC8vIGBkZWJvdW5jZVRpbWVgIG9wZXJhdG9yIG9yIHZpY2UtdmVyc2EgcmVtb3ZlIGl0LlxuICAgIGlmIChjaGFuZ2VzLmRlYm91bmNlVGltZSkge1xuICAgICAgdGhpcy5hZGRRdWlsbEV2ZW50TGlzdGVuZXJzKClcbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvZG90LW5vdGF0aW9uICovXG4gIH1cblxuICBhZGRDbGFzc2VzKGNsYXNzTGlzdDogc3RyaW5nKTogdm9pZCB7XG4gICAgUXVpbGxFZGl0b3JCYXNlLm5vcm1hbGl6ZUNsYXNzTmFtZXMoY2xhc3NMaXN0KS5mb3JFYWNoKChjOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5lZGl0b3JFbGVtLCBjKVxuICAgIH0pXG4gIH1cblxuICByZW1vdmVDbGFzc2VzKGNsYXNzTGlzdDogc3RyaW5nKTogdm9pZCB7XG4gICAgUXVpbGxFZGl0b3JCYXNlLm5vcm1hbGl6ZUNsYXNzTmFtZXMoY2xhc3NMaXN0KS5mb3JFYWNoKChjOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5lZGl0b3JFbGVtLCBjKVxuICAgIH0pXG4gIH1cblxuICB3cml0ZVZhbHVlKGN1cnJlbnRWYWx1ZTogYW55KSB7XG5cbiAgICAvLyBvcHRpb25hbCBmaXggZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzE0OTg4XG4gICAgaWYgKHRoaXMuZmlsdGVyTnVsbCAmJiBjdXJyZW50VmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuY29udGVudCA9IGN1cnJlbnRWYWx1ZVxuXG4gICAgaWYgKCF0aGlzLnF1aWxsRWRpdG9yKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBmb3JtYXQgPSBnZXRGb3JtYXQodGhpcy5mb3JtYXQsIHRoaXMuc2VydmljZS5jb25maWcuZm9ybWF0KVxuICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy52YWx1ZVNldHRlcih0aGlzLnF1aWxsRWRpdG9yLCBjdXJyZW50VmFsdWUpXG5cbiAgICBpZiAodGhpcy5jb21wYXJlVmFsdWVzKSB7XG4gICAgICBjb25zdCBjdXJyZW50RWRpdG9yVmFsdWUgPSB0aGlzLnF1aWxsRWRpdG9yLmdldENvbnRlbnRzKClcbiAgICAgIGlmIChKU09OLnN0cmluZ2lmeShjdXJyZW50RWRpdG9yVmFsdWUpID09PSBKU09OLnN0cmluZ2lmeShuZXdWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRWYWx1ZSkge1xuICAgICAgaWYgKGZvcm1hdCA9PT0gJ3RleHQnKSB7XG4gICAgICAgIHRoaXMucXVpbGxFZGl0b3Iuc2V0VGV4dChjdXJyZW50VmFsdWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnF1aWxsRWRpdG9yLnNldENvbnRlbnRzKG5ld1ZhbHVlKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMucXVpbGxFZGl0b3Iuc2V0VGV4dCgnJylcblxuICB9XG5cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuID0gdGhpcy5kaXNhYmxlZCk6IHZvaWQge1xuICAgIC8vIHN0b3JlIGluaXRpYWwgdmFsdWUgdG8gc2V0IGFwcHJvcHJpYXRlIGRpc2FibGVkIHN0YXR1cyBhZnRlciBWaWV3SW5pdFxuICAgIHRoaXMuZGlzYWJsZWQgPSBpc0Rpc2FibGVkXG4gICAgaWYgKHRoaXMucXVpbGxFZGl0b3IpIHtcbiAgICAgIGlmIChpc0Rpc2FibGVkKSB7XG4gICAgICAgIHRoaXMucXVpbGxFZGl0b3IuZGlzYWJsZSgpXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0QXR0cmlidXRlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlYWRPbmx5KSB7XG4gICAgICAgICAgdGhpcy5xdWlsbEVkaXRvci5lbmFibGUoKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQXR0cmlidXRlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnZGlzYWJsZWQnKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IChtb2RlbFZhbHVlOiBhbnkpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLm9uTW9kZWxDaGFuZ2UgPSBmblxuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLm9uTW9kZWxUb3VjaGVkID0gZm5cbiAgfVxuXG4gIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2UoZm46ICgpID0+IHZvaWQpIHtcbiAgICB0aGlzLm9uVmFsaWRhdG9yQ2hhbmdlZCA9IGZuXG4gIH1cblxuICB2YWxpZGF0ZSgpIHtcbiAgICBpZiAoIXRoaXMucXVpbGxFZGl0b3IpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgY29uc3QgZXJyOiB7XG4gICAgICBtaW5MZW5ndGhFcnJvcj86IHtcbiAgICAgICAgZ2l2ZW46IG51bWJlclxuICAgICAgICBtaW5MZW5ndGg6IG51bWJlclxuICAgICAgfVxuICAgICAgbWF4TGVuZ3RoRXJyb3I/OiB7XG4gICAgICAgIGdpdmVuOiBudW1iZXJcbiAgICAgICAgbWF4TGVuZ3RoOiBudW1iZXJcbiAgICAgIH1cbiAgICAgIHJlcXVpcmVkRXJyb3I/OiB7IGVtcHR5OiBib29sZWFuIH1cbiAgICB9ID0ge31cbiAgICBsZXQgdmFsaWQgPSB0cnVlXG5cbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5xdWlsbEVkaXRvci5nZXRUZXh0KClcbiAgICAvLyB0cmltIHRleHQgaWYgd2FudGVkICsgaGFuZGxlIHNwZWNpYWwgY2FzZSB0aGF0IGFuIGVtcHR5IGVkaXRvciBjb250YWlucyBhIG5ldyBsaW5lXG4gICAgY29uc3QgdGV4dExlbmd0aCA9IHRoaXMudHJpbU9uVmFsaWRhdGlvbiA/IHRleHQudHJpbSgpLmxlbmd0aCA6ICh0ZXh0Lmxlbmd0aCA9PT0gMSAmJiB0ZXh0LnRyaW0oKS5sZW5ndGggPT09IDAgPyAwIDogdGV4dC5sZW5ndGggLSAxKVxuICAgIGNvbnN0IGRlbHRhT3BlcmF0aW9ucyA9IHRoaXMucXVpbGxFZGl0b3IuZ2V0Q29udGVudHMoKS5vcHNcbiAgICBjb25zdCBvbmx5RW1wdHlPcGVyYXRpb24gPSBkZWx0YU9wZXJhdGlvbnMgJiYgZGVsdGFPcGVyYXRpb25zLmxlbmd0aCA9PT0gMSAmJiBbJ1xcbicsICcnXS5pbmNsdWRlcyhkZWx0YU9wZXJhdGlvbnNbMF0uaW5zZXJ0KVxuXG4gICAgaWYgKHRoaXMubWluTGVuZ3RoICYmIHRleHRMZW5ndGggJiYgdGV4dExlbmd0aCA8IHRoaXMubWluTGVuZ3RoKSB7XG4gICAgICBlcnIubWluTGVuZ3RoRXJyb3IgPSB7XG4gICAgICAgIGdpdmVuOiB0ZXh0TGVuZ3RoLFxuICAgICAgICBtaW5MZW5ndGg6IHRoaXMubWluTGVuZ3RoXG4gICAgICB9XG5cbiAgICAgIHZhbGlkID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAodGhpcy5tYXhMZW5ndGggJiYgdGV4dExlbmd0aCA+IHRoaXMubWF4TGVuZ3RoKSB7XG4gICAgICBlcnIubWF4TGVuZ3RoRXJyb3IgPSB7XG4gICAgICAgIGdpdmVuOiB0ZXh0TGVuZ3RoLFxuICAgICAgICBtYXhMZW5ndGg6IHRoaXMubWF4TGVuZ3RoXG4gICAgICB9XG5cbiAgICAgIHZhbGlkID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZXF1aXJlZCAmJiAhdGV4dExlbmd0aCAmJiBvbmx5RW1wdHlPcGVyYXRpb24pIHtcbiAgICAgIGVyci5yZXF1aXJlZEVycm9yID0ge1xuICAgICAgICBlbXB0eTogdHJ1ZVxuICAgICAgfVxuXG4gICAgICB2YWxpZCA9IGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IGVyclxuICB9XG5cbiAgcHJpdmF0ZSBhZGRRdWlsbEV2ZW50TGlzdGVuZXJzKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZSgpXG5cbiAgICAvLyBXZSBoYXZlIHRvIGVudGVyIHRoZSBgPHJvb3Q+YCB6b25lIHdoZW4gYWRkaW5nIGV2ZW50IGxpc3RlbmVycywgc28gYGRlYm91bmNlVGltZWAgd2lsbCBzcGF3biB0aGVcbiAgICAvLyBgQXN5bmNBY3Rpb25gIHRoZXJlIHcvbyB0cmlnZ2VyaW5nIGNoYW5nZSBkZXRlY3Rpb25zLiBXZSBzdGlsbCByZS1lbnRlciB0aGUgQW5ndWxhcidzIHpvbmUgdGhyb3VnaFxuICAgIC8vIGB6b25lLnJ1bmAgd2hlbiB3ZSBlbWl0IGFuIGV2ZW50IHRvIHRoZSBwYXJlbnQgY29tcG9uZW50LlxuICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKVxuXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgIC8vIG1hcmsgbW9kZWwgYXMgdG91Y2hlZCBpZiBlZGl0b3IgbG9zdCBmb2N1c1xuICAgICAgICBmcm9tRXZlbnQodGhpcy5xdWlsbEVkaXRvciwgJ3NlbGVjdGlvbi1jaGFuZ2UnKS5zdWJzY3JpYmUoXG4gICAgICAgICAgKFtyYW5nZSwgb2xkUmFuZ2UsIHNvdXJjZV0pID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uQ2hhbmdlSGFuZGxlcihyYW5nZSBhcyBhbnksIG9sZFJhbmdlIGFzIGFueSwgc291cmNlKVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKVxuXG4gICAgICAvLyBUaGUgYGZyb21FdmVudGAgc3VwcG9ydHMgcGFzc2luZyBKUXVlcnktc3R5bGUgZXZlbnQgdGFyZ2V0cywgdGhlIGVkaXRvciBoYXMgYG9uYCBhbmQgYG9mZmAgbWV0aG9kcyB3aGljaFxuICAgICAgLy8gd2lsbCBiZSBpbnZva2VkIHVwb24gc3Vic2NyaXB0aW9uIGFuZCB0ZWFyZG93bi5cbiAgICAgIGxldCB0ZXh0Q2hhbmdlJCA9IGZyb21FdmVudCh0aGlzLnF1aWxsRWRpdG9yLCAndGV4dC1jaGFuZ2UnKVxuICAgICAgbGV0IGVkaXRvckNoYW5nZSQgPSBmcm9tRXZlbnQodGhpcy5xdWlsbEVkaXRvciwgJ2VkaXRvci1jaGFuZ2UnKVxuXG4gICAgICBpZiAodHlwZW9mIHRoaXMuZGVib3VuY2VUaW1lID09PSAnbnVtYmVyJykge1xuICAgICAgICB0ZXh0Q2hhbmdlJCA9IHRleHRDaGFuZ2UkLnBpcGUoZGVib3VuY2VUaW1lKHRoaXMuZGVib3VuY2VUaW1lKSlcbiAgICAgICAgZWRpdG9yQ2hhbmdlJCA9IGVkaXRvckNoYW5nZSQucGlwZShkZWJvdW5jZVRpbWUodGhpcy5kZWJvdW5jZVRpbWUpKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgIC8vIHVwZGF0ZSBtb2RlbCBpZiB0ZXh0IGNoYW5nZXNcbiAgICAgICAgdGV4dENoYW5nZSQuc3Vic2NyaWJlKChbZGVsdGEsIG9sZERlbHRhLCBzb3VyY2VdKSA9PiB7XG4gICAgICAgICAgdGhpcy50ZXh0Q2hhbmdlSGFuZGxlcihkZWx0YSBhcyBhbnksIG9sZERlbHRhIGFzIGFueSwgc291cmNlKVxuICAgICAgICB9KVxuICAgICAgKVxuXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgIC8vIHRyaWdnZXJlZCBpZiBzZWxlY3Rpb24gb3IgdGV4dCBjaGFuZ2VkXG4gICAgICAgIGVkaXRvckNoYW5nZSQuc3Vic2NyaWJlKChbZXZlbnQsIGN1cnJlbnQsIG9sZCwgc291cmNlXSkgPT4ge1xuICAgICAgICAgIHRoaXMuZWRpdG9yQ2hhbmdlSGFuZGxlcihldmVudCBhcyAndGV4dC1jaGFuZ2UnIHwgJ3NlbGVjdGlvbi1jaGFuZ2UnLCBjdXJyZW50LCBvbGQsIHNvdXJjZSlcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbiAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKVxuICAgICAgdGhpcy5zdWJzY3JpcHRpb24gPSBudWxsXG4gICAgfVxuICB9XG59XG5cbkBDb21wb25lbnQoe1xuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11c2UtYmVmb3JlLWRlZmluZVxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gUXVpbGxFZGl0b3JDb21wb25lbnQpXG4gICAgfSxcbiAgICB7XG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBRdWlsbEVkaXRvckNvbXBvbmVudClcbiAgICB9XG4gIF0sXG4gIHNlbGVjdG9yOiAncXVpbGwtZWRpdG9yJyxcbiAgdGVtcGxhdGU6IGBcbiAgPG5nLWNvbnRlbnQgc2VsZWN0PVwiW3F1aWxsLWVkaXRvci10b29sYmFyXVwiPjwvbmctY29udGVudD5cbmAsXG4gIHN0eWxlczogW1xuICAgIGBcbiAgICA6aG9zdCB7XG4gICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgfVxuICAgIGBcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBRdWlsbEVkaXRvckNvbXBvbmVudCBleHRlbmRzIFF1aWxsRWRpdG9yQmFzZSB7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgIEBJbmplY3QoRWxlbWVudFJlZikgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICBASW5qZWN0KENoYW5nZURldGVjdG9yUmVmKSBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgQEluamVjdChEb21TYW5pdGl6ZXIpIGRvbVNhbml0aXplcjogRG9tU2FuaXRpemVyLFxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHBsYXRmb3JtSWQ6IGFueSxcbiAgICBASW5qZWN0KFJlbmRlcmVyMikgcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgICBASW5qZWN0KE5nWm9uZSkgem9uZTogTmdab25lLFxuICAgIEBJbmplY3QoUXVpbGxTZXJ2aWNlKSBzZXJ2aWNlOiBRdWlsbFNlcnZpY2VcbiAgKSB7XG4gICAgc3VwZXIoXG4gICAgICBpbmplY3RvcixcbiAgICAgIGVsZW1lbnRSZWYsXG4gICAgICBjZCxcbiAgICAgIGRvbVNhbml0aXplcixcbiAgICAgIHBsYXRmb3JtSWQsXG4gICAgICByZW5kZXJlcixcbiAgICAgIHpvbmUsXG4gICAgICBzZXJ2aWNlXG4gICAgKVxuICB9XG5cbn1cbiJdfQ==