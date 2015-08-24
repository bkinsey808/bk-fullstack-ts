import {CONST, CONST_EXPR} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';
import {InjectableMetadata} from 'angular2/src/di/metadata';
import {DEFAULT} from 'angular2/change_detection';

/**
 * Directives allow you to attach behavior to elements in the DOM.
 *
 * {@link DirectiveMetadata}s with an embedded view are called {@link ComponentMetadata}s.
 *
 * A directive consists of a single directive annotation and a controller class. When the
 * directive's `selector` matches
 * elements in the DOM, the following steps occur:
 *
 * 1. For each directive, the `ElementInjector` attempts to resolve the directive's constructor
 * arguments.
 * 2. Angular instantiates directives for each matched element using `ElementInjector` in a
 * depth-first order,
 *    as declared in the HTML.
 *
 * ## Understanding How Injection Works
 *
 * There are three stages of injection resolution.
 * - *Pre-existing Injectors*:
 *   - The terminal {@link Injector} cannot resolve dependencies. It either throws an error or, if
 * the dependency was
 *     specified as `@Optional`, returns `null`.
 *   - The platform injector resolves browser singleton resources, such as: cookies, title,
 * location, and others.
 * - *Component Injectors*: Each component instance has its own {@link Injector}, and they follow
 * the same parent-child hierarchy
 *     as the component instances in the DOM.
 * - *Element Injectors*: Each component instance has a Shadow DOM. Within the Shadow DOM each
 * element has an `ElementInjector`
 *     which follow the same parent-child hierarchy as the DOM elements themselves.
 *
 * When a template is instantiated, it also must instantiate the corresponding directives in a
 * depth-first order. The
 * current `ElementInjector` resolves the constructor dependencies for each directive.
 *
 * Angular then resolves dependencies as follows, according to the order in which they appear in the
 * {@link ViewMetadata}:
 *
 * 1. Dependencies on the current element
 * 2. Dependencies on element injectors and their parents until it encounters a Shadow DOM boundary
 * 3. Dependencies on component injectors and their parents until it encounters the root component
 * 4. Dependencies on pre-existing injectors
 *
 *
 * The `ElementInjector` can inject other directives, element-specific special objects, or it can
 * delegate to the parent
 * injector.
 *
 * To inject other directives, declare the constructor parameter as:
 * - `directive:DirectiveType`: a directive on the current element only
 * - `@Host() directive:DirectiveType`: any directive that matches the type between the current
 * element and the
 *    Shadow DOM root.
 * - `@Query(DirectiveType) query:QueryList<DirectiveType>`: A live collection of direct child
 * directives.
 * - `@QueryDescendants(DirectiveType) query:QueryList<DirectiveType>`: A live collection of any
 * child directives.
 *
 * To inject element-specific special objects, declare the constructor parameter as:
 * - `element: ElementRef` to obtain a reference to logical element in the view.
 * - `viewContainer: ViewContainerRef` to control child template instantiation, for
 * {@link DirectiveMetadata} directives only
 * - `bindingPropagation: BindingPropagation` to control change detection in a more granular way.
 *
 * ## Example
 *
 * The following example demonstrates how dependency injection resolves constructor arguments in
 * practice.
 *
 *
 * Assume this HTML template:
 *
 * ```
 * <div dependency="1">
 *   <div dependency="2">
 *     <div dependency="3" my-directive>
 *       <div dependency="4">
 *         <div dependency="5"></div>
 *       </div>
 *       <div dependency="6"></div>
 *     </div>
 *   </div>
 * </div>
 * ```
 *
 * With the following `dependency` decorator and `SomeService` injectable class.
 *
 * ```
 * @Injectable()
 * class SomeService {
 * }
 *
 * @Directive({
 *   selector: '[dependency]',
 *   properties: [
 *     'id: dependency'
 *   ]
 * })
 * class Dependency {
 *   id:string;
 * }
 * ```
 *
 * Let's step through the different ways in which `MyDirective` could be declared...
 *
 *
 * ### No injection
 *
 * Here the constructor is declared with no arguments, therefore nothing is injected into
 * `MyDirective`.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor() {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with no dependencies.
 *
 *
 * ### Component-level injection
 *
 * Directives can inject any injectable instance from the closest component injector or any of its
 * parents.
 *
 * Here, the constructor declares a parameter, `someService`, and injects the `SomeService` type
 * from the parent
 * component's injector.
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(someService: SomeService) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a dependency on `SomeService`.
 *
 *
 * ### Injecting a directive from the current element
 *
 * Directives can inject other directives declared on the current element.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(dependency: Dependency) {
 *     expect(dependency.id).toEqual(3);
 *   }
 * }
 * ```
 * This directive would be instantiated with `Dependency` declared at the same element, in this case
 * `dependency="3"`.
 *
 * ### Injecting a directive from any ancestor elements
 *
 * Directives can inject other directives declared on any ancestor element (in the current Shadow
 * DOM), i.e. on the current element, the
 * parent element, or its parents.
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Host() dependency: Dependency) {
 *     expect(dependency.id).toEqual(2);
 *   }
 * }
 * ```
 *
 * `@Host` checks the current element, the parent, as well as its parents recursively. If
 * `dependency="2"` didn't
 * exist on the direct parent, this injection would
 * have returned
 * `dependency="1"`.
 *
 *
 * ### Injecting a live collection of direct child directives
 *
 *
 * A directive can also query for other child directives. Since parent directives are instantiated
 * before child directives, a directive can't simply inject the list of child directives. Instead,
 * the directive injects a {@link QueryList}, which updates its contents as children are added,
 * removed, or moved by a directive that uses a {@link ViewContainerRef} such as a `ng-for`, an
 * `ng-if`, or an `ng-switch`.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Query(Dependency) dependencies:QueryList<Dependency>) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a {@link QueryList} which contains `Dependency` 4 and
 * 6. Here, `Dependency` 5 would not be included, because it is not a direct child.
 *
 * ### Injecting a live collection of descendant directives
 *
 * By passing the descendant flag to `@Query` above, we can include the children of the child
 * elements.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Query(Dependency, {descendants: true}) dependencies:QueryList<Dependency>) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a Query which would contain `Dependency` 4, 5 and 6.
 *
 * ### Optional injection
 *
 * The normal behavior of directives is to return an error when a specified dependency cannot be
 * resolved. If you
 * would like to inject `null` on unresolved dependency instead, you can annotate that dependency
 * with `@Optional()`.
 * This explicitly permits the author of a template to treat some of the surrounding directives as
 * optional.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Optional() dependency:Dependency) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a `Dependency` directive found on the current element.
 * If none can be
 * found, the injector supplies `null` instead of throwing an error.
 *
 * ## Example
 *
 * Here we use a decorator directive to simply define basic tool-tip behavior.
 *
 * ```
 * @Directive({
 *   selector: '[tooltip]',
 *   properties: [
 *     'text: tooltip'
 *   ],
 *   host: {
 *     '(mouseenter)': 'onMouseEnter()',
 *     '(mouseleave)': 'onMouseLeave()'
 *   }
 * })
 * class Tooltip{
 *   text:string;
 *   overlay:Overlay; // NOT YET IMPLEMENTED
 *   overlayManager:OverlayManager; // NOT YET IMPLEMENTED
 *
 *   constructor(overlayManager:OverlayManager) {
 *     this.overlay = overlay;
 *   }
 *
 *   onMouseEnter() {
 *     // exact signature to be determined
 *     this.overlay = this.overlayManager.open(text, ...);
 *   }
 *
 *   onMouseLeave() {
 *     this.overlay.close();
 *     this.overlay = null;
 *   }
 * }
 * ```
 * In our HTML template, we can then add this behavior to a `<div>` or any other element with the
 * `tooltip` selector,
 * like so:
 *
 * ```
 * <div tooltip="some text here"></div>
 * ```
 *
 * Directives can also control the instantiation, destruction, and positioning of inline template
 * elements:
 *
 * A directive uses a {@link ViewContainerRef} to instantiate, insert, move, and destroy views at
 * runtime.
 * The {@link ViewContainerRef} is created as a result of `<template>` element, and represents a
 * location in the current view
 * where these actions are performed.
 *
 * Views are always created as children of the current {@link ViewMetadata}, and as siblings of the
 * `<template>` element. Thus a
 * directive in a child view cannot inject the directive that created it.
 *
 * Since directives that create views via ViewContainers are common in Angular, and using the full
 * `<template>` element syntax is wordy, Angular
 * also supports a shorthand notation: `<li *foo="bar">` and `<li template="foo: bar">` are
 * equivalent.
 *
 * Thus,
 *
 * ```
 * <ul>
 *   <li *foo="bar" title="text"></li>
 * </ul>
 * ```
 *
 * Expands in use to:
 *
 * ```
 * <ul>
 *   <template [foo]="bar">
 *     <li title="text"></li>
 *   </template>
 * </ul>
 * ```
 *
 * Notice that although the shorthand places `*foo="bar"` within the `<li>` element, the binding for
 * the directive
 * controller is correctly instantiated on the `<template>` element rather than the `<li>` element.
 *
 *
 * ## Example
 *
 * Let's suppose we want to implement the `unless` behavior, to conditionally include a template.
 *
 * Here is a simple directive that triggers on an `unless` selector:
 *
 * ```
 * @Directive({
 *   selector: '[unless]',
 *   properties: ['unless']
 * })
 * export class Unless {
 *   viewContainer: ViewContainerRef;
 *   templateRef: TemplateRef;
 *   prevCondition: boolean;
 *
 *   constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef) {
 *     this.viewContainer = viewContainer;
 *     this.templateRef = templateRef;
 *     this.prevCondition = null;
 *   }
 *
 *   set unless(newCondition) {
 *     if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
 *       this.prevCondition = true;
 *       this.viewContainer.clear();
 *     } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
 *       this.prevCondition = false;
 *       this.viewContainer.create(this.templateRef);
 *     }
 *   }
 * }
 * ```
 *
 * We can then use this `unless` selector in a template:
 * ```
 * <ul>
 *   <li *unless="expr"></li>
 * </ul>
 * ```
 *
 * Once the directive instantiates the child view, the shorthand notation for the template expands
 * and the result is:
 *
 * ```
 * <ul>
 *   <template [unless]="exp">
 *     <li></li>
 *   </template>
 *   <li></li>
 * </ul>
 * ```
 *
 * Note also that although the `<li></li>` template still exists inside the `<template></template>`,
 * the instantiated
 * view occurs on the second `<li></li>` which is a sibling to the `<template>` element.
 */
@CONST()
export class DirectiveMetadata extends InjectableMetadata {
  /**
   * The CSS selector that triggers the instantiation of a directive.
   *
   * Angular only allows directives to trigger on CSS selectors that do not cross element
   * boundaries.
   *
   * `selector` may be declared as one of the following:
   *
   * - `element-name`: select by element name.
   * - `.class`: select by class name.
   * - `[attribute]`: select by attribute name.
   * - `[attribute=value]`: select by attribute name and value.
   * - `:not(sub_selector)`: select only if the element does not match the `sub_selector`.
   * - `selector1, selector2`: select if either `selector1` or `selector2` matches.
   *
   *
   * ## Example
   *
   * Suppose we have a directive with an `input[type=text]` selector.
   *
   * And the following HTML:
   *
   * ```html
   * <form>
   *   <input type="text">
   *   <input type="radio">
   * <form>
   * ```
   *
   * The directive would only be instantiated on the `<input type="text">` element.
   *
   */
  selector: string;

  /**
   * Enumerates the set of properties that accept data binding for a directive.
   *
   * The `properties` property defines a set of `directiveProperty` to `bindingProperty`
   * configuration:
   *
   * - `directiveProperty` specifies the component property where the value is written.
   * - `bindingProperty` specifies the DOM property where the value is read from.
   *
   * You can include a {@link PipeMetadata} when specifying a `bindingProperty` to allow for data
   * transformation and structural change detection of the value. These pipes will be evaluated in
   * the context of this component.
   *
   * ## Syntax
   *
   * There is no need to specify both `directiveProperty` and `bindingProperty` when they both have
   * the same value.
   *
   * ```
   * @Directive({
   *   properties: [
   *     'propertyName', // shorthand notation for 'propertyName: propertyName'
   *     'directiveProperty1: bindingProperty1',
   *     'directiveProperty2: bindingProperty2 | pipe1 | ...',
   *     ...
   *   ]
   * }
   * ```
   *
   *
   * ## Basic Property Binding
   *
   * We can easily build a simple `Tooltip` directive that exposes a `tooltip` property, which can
   * be used in templates with standard Angular syntax. For example:
   *
   * ```
   * @Directive({
   *   selector: '[tooltip]',
   *   properties: [
   *     'text: tooltip'
   *   ]
   * })
   * class Tooltip {
   *   set text(value: string) {
   *     // This will get called every time with the new value when the 'tooltip' property changes
   *   }
   * }
   * ```
   *
   * We can then bind to the `tooltip' property as either an expression (`someExpression`) or as a
   * string literal, as shown in the HTML template below:
   *
   * ```html
   * <div [tooltip]="someExpression">...</div>
   * <div tooltip="Some Text">...</div>
   * ```
   *
   * Whenever the `someExpression` expression changes, the `properties` declaration instructs
   * Angular to update the `Tooltip`'s `text` property.
   *
   * ### Bindings With Pipes
   *
   * You can use pipes in bindings, as follows:
   *
   * ```html
   * <div [class-set]="someExpression | somePipe">
   * ```
   *
   */
  properties: List<string>;

  /**
   * Enumerates the set of emitted events.
   *
   * ## Syntax
   *
   * ```
   * @Component({
   *   events: ['statusChange']
   * })
   * class TaskComponent {
   *   statusChange: EventEmitter;
   *
   *   constructor() {
   *     this.statusChange = new EventEmitter();
   *   }
   *
   *   onComplete() {
   *     this.statusChange.next('completed');
   *   }
   * }
   * ```
   *
   * Use `propertyName: eventName` when the event emitter property name is different from the name
   * of the emitted event:
   *
   * ```
   * @Component({
   *   events: ['status: statusChange']
   * })
   * class TaskComponent {
   *   status: EventEmitter;
   *
   *   constructor() {
   *     this.status = new EventEmitter();
   *   }
   *
   *   onComplete() {
   *     this.status.next('completed');
   *   }
   * }
   * ```
   *
   */
  events: List<string>;

  /**
   * Specifiy the events, actions, properties and attributes related to the host element.
   *
   * ## Events
   *
   * Specifies which DOM hostListeners a directive listens to via a set of `(event)` to `method`
   * key-value pairs:
   *
   * - `event1`: the DOM event that the directive listens to.
   * - `statement`: the statement to execute when the event occurs.
   * If the evalutation of the statement returns `false`, then `preventDefault`is applied on the DOM
   * event.
   *
   * To listen to global events, a target must be added to the event name.
   * The target can be `window`, `document` or `body`.
   *
   * When writing a directive event binding, you can also refer to the following local variables:
   * - `$event`: Current event object which triggered the event.
   * - `$target`: The source of the event. This will be either a DOM element or an Angular
   * directive. (will be implemented in later release)
   *
   * ## Syntax
   *
   * ```
   * @Directive({
   *   host: {
   *     '(event1)': 'onMethod1(arguments)',
   *     '(target:event2)': 'onMethod2(arguments)',
   *     ...
   *   }
   * }
   * ```
   *
   * ## Basic Event Binding:
   *
   * Suppose you want to write a directive that reacts to `change` events in the DOM and on
   * `resize` events in window.
   * You would define the event binding as follows:
   *
   * ```
   * @Directive({
   *   selector: 'input',
   *   host: {
   *     '(change)': 'onChange($event)',
   *     '(window:resize)': 'onResize($event)'
   *   }
   * })
   * class InputDirective {
   *   onChange(event:Event) {
   *     // invoked when the input element fires the 'change' event
   *   }
   *   onResize(event:Event) {
   *     // invoked when the window fires the 'resize' event
   *   }
   * }
   * ```
   *
   * ## Properties
   *
   * Specifies which DOM properties a directives updates.
   *
   * ## Syntax
   *
   * ```
   * @Directive({
   *   selector: 'input',
   *   host: {
   *     '[prop]': 'expression'
   *   }
   * })
   * class InputDirective {
   *   value:string;
   * }
   * ```
   *
   * In this example the prop property of the host element is updated with the expression value
   * every time it changes.
   *
   * ## Attributes
   *
   * Specifies static attributes that should be propagated to a host element. Attributes specified
   * in `hostAttributes` are propagated only if a given attribute is not present on a host element.
   *
   * ## Syntax
   *
   * ```
   * @Directive({
   *   selector: '[my-button]',
   *   host: {
   *     'role': 'button'
   *   }
   * })
   * class MyButton {
   * }
   * ```
   *
   * In this example using `my-button` directive (ex.: `<div my-button></div>`) on a host element
   * (here: `<div>` ) will ensure that this element will get the "button" role.
   *
   * ## Actions
   *
   * Specifies which DOM methods a directive can invoke.
   *
   * ## Syntax
   *
   * ```
   * @Directive({
   *   selector: 'input',
   *   host: {
   *     '@emitFocus': 'focus()'
   *   }
   * })
   * class InputDirective {
   *   constructor() {
   *     this.emitFocus = new EventEmitter();
   *   }
   *
   *   focus() {
   *     this.emitFocus.next();
   *   }
   * }
   * ```
   *
   * In this example calling focus on InputDirective will result in calling focus on the input.
   */
  host: StringMap<string, string>;

  /**
   * Specifies which lifecycle should be notified to the directive.
   *
   * See {@link LifecycleEvent} for details.
   */
  lifecycle: List<LifecycleEvent>;

  /**
   * If set to false the compiler does not compile the children of this directive.
   */
  // TODO(vsavkin): This would better fall under the Macro directive concept.
  compileChildren: boolean;

  /**
   * Defines the set of injectable objects that are visible to a Directive and its light dom
   * children.
   *
   * ## Simple Example
   *
   * Here is an example of a class that can be injected:
   *
   * ```
   * class Greeter {
   *    greet(name:string) {
   *      return 'Hello ' + name + '!';
   *    }
   * }
   *
   * @Directive({
   *   selector: 'greet',
   *   bindings: [
   *     Greeter
   *   ]
   * })
   * class HelloWorld {
   *   greeter:Greeter;
   *
   *   constructor(greeter:Greeter) {
   *     this.greeter = greeter;
   *   }
   * }
   * ```
   */
  bindings: List<any>;

  /**
   * Defines the name that can be used in the template to assign this directive to a variable.
   *
   * ## Simple Example
   *
   * ```
   * @Directive({
   *   selector: 'child-dir',
   *   exportAs: 'child'
   * })
   * class ChildDir {
   * }
   *
   * @Component({
   *   selector: 'main',
   * })
   * @View({
   *   template: `<child-dir #c="child"></child-dir>`,
   *   directives: [ChildDir]
   * })
   * class MainComponent {
   * }
   *
   * ```
   */
  exportAs: string;

  constructor({
                  selector, properties, events, host, lifecycle, bindings, exportAs,
                  compileChildren = true,
              }: {
    selector?: string,
    properties?: List<string>,
    events?: List<string>,
    host?: StringMap<string, string>,
    lifecycle?: List<LifecycleEvent>,
    bindings?: List<any>,
    exportAs?: string,
    compileChildren?: boolean,
  } = {}) {
    super();
    this.selector = selector;
    this.properties = properties;
    this.events = events;
    this.host = host;
    this.exportAs = exportAs;
    this.lifecycle = lifecycle;
    this.compileChildren = compileChildren;
    this.bindings = bindings;
  }
}

/**
 * Declare reusable UI building blocks for an application.
 *
 * Each Angular component requires a single `@Component` and at least one `@View` annotation. The
 * `@Component`
 * annotation specifies when a component is instantiated, and which properties and hostListeners it
 * binds to.
 *
 * When a component is instantiated, Angular
 * - creates a shadow DOM for the component.
 * - loads the selected template into the shadow DOM.
 * - creates all the injectable objects configured with `bindings` and `viewBindings`.
 *
 * All template expressions and statements are then evaluated against the component instance.
 *
 * For details on the `@View` annotation, see {@link ViewMetadata}.
 *
 * ## Example
 *
 * ```
 * @Component({
 *   selector: 'greet'
 * })
 * @View({
 *   template: 'Hello {{name}}!'
 * })
 * class Greet {
 *   name: string;
 *
 *   constructor() {
 *     this.name = 'World';
 *   }
 * }
 * ```
 *
 */
@CONST()
export class ComponentMetadata extends DirectiveMetadata {
  /**
   * Defines the used change detection strategy.
   *
   * When a component is instantiated, Angular creates a change detector, which is responsible for
   * propagating
   * the component's bindings.
   *
   * The `changeDetection` property defines, whether the change detection will be checked every time
   * or only when the component
   * tells it to do so.
   */
  changeDetection: string;

  /**
   * Defines the set of injectable objects that are visible to its view dom children.
   *
   * ## Simple Example
   *
   * Here is an example of a class that can be injected:
   *
   * ```
   * class Greeter {
   *    greet(name:string) {
   *      return 'Hello ' + name + '!';
   *    }
   * }
   *
   * @Directive({
   *   selector: 'needs-greeter'
   * })
   * class NeedsGreeter {
   *   greeter:Greeter;
   *
   *   constructor(greeter:Greeter) {
   *     this.greeter = greeter;
   *   }
   * }
   *
   * @Component({
   *   selector: 'greet',
   *   viewBindings: [
   *     Greeter
   *   ]
   * })
   * @View({
   *   template: `<needs-greeter></needs-greeter>`,
   *   directives: [NeedsGreeter]
   * })
   * class HelloWorld {
   * }
   *
   * ```
   */
  viewBindings: List<any>;

  constructor({selector, properties, events, host, exportAs, lifecycle, bindings, viewBindings,
               changeDetection = DEFAULT, compileChildren = true}: {
    selector?: string,
    properties?: List<string>,
    events?: List<string>,
    host?: StringMap<string, string>,
    lifecycle?: List<LifecycleEvent>,
    bindings?: List<any>,
    exportAs?: string,
    compileChildren?: boolean,
    viewBindings?: List<any>,
    changeDetection?: string,
  } = {}) {
    super({
      selector: selector,
      properties: properties,
      events: events,
      host: host,
      exportAs: exportAs,
      bindings: bindings,
      lifecycle: lifecycle,
      compileChildren: compileChildren
    });

    this.changeDetection = changeDetection;
    this.viewBindings = viewBindings;
  }
}

/**
 * Lifecycle events are guaranteed to be called in the following order:
 * - `onChange` (optional if any bindings have changed),
 * - `onInit` (optional after the first check only),
 * - `onCheck`,
 * - `onAllChangesDone`
 */
export enum LifecycleEvent {
  /**
   * Notify a directive whenever a {@link ViewMetadata} that contains it is destroyed.
   *
   * ## Example
   *
   * ```
   * @Directive({
   *   ...,
   *   lifecycle: [LifecycleEvent.onDestroy]
   * })
   * class ClassSet {
   *   onDestroy() {
   *     // invoked to notify directive of the containing view destruction.
   *   }
   * }
   * ```
   */
  onDestroy,


  /**
   * Notify a directive when any of its bindings have changed.
   *
   * This method is called right after the directive's bindings have been checked,
   * and before any of its children's bindings have been checked.
   *
   * It is invoked only if at least one of the directive's bindings has changed.
   *
   * ## Example:
   *
   * ```
   * @Directive({
   *   selector: '[class-set]',
   *   properties: [
   *     'propA',
   *     'propB'
   *   ],
   *   lifecycle: [LifecycleEvent.onChange]
   * })
   * class ClassSet {
   *   propA;
   *   propB;
   *   onChange(changes:{[idx: string, PropertyUpdate]}) {
   *     // This will get called after any of the properties have been updated.
   *     if (changes['propA']) {
   *       // if propA was updated
   *     }
   *     if (changes['propA']) {
   *       // if propB was updated
   *     }
   *   }
   * }
   *  ```
   */
  onChange,

  /**
   * Notify a directive when it has been checked.
   *
   * This method is called right after the directive's bindings have been checked,
   * and before any of its children's bindings have been checked.
   *
   * It is invoked every time even when none of the directive's bindings has changed.
   *
   * ## Example
   *
   * ```
   * @Directive({
   *   selector: '[class-set]',
   *   lifecycle: [LifecycleEvent.onCheck]
   * })
   * class ClassSet {
   *   onCheck() {
   *   }
   * }
   *  ```
   */
  onCheck,

  /**
   * Notify a directive when it has been checked the first itme.
   *
   * This method is called right after the directive's bindings have been checked,
   * and before any of its children's bindings have been checked.
   *
   * It is invoked only once.
   *
   * ## Example
   *
   * ```
   * @Directive({
   *   selector: '[class-set]',
   *   lifecycle: [LifecycleEvent.onInit]
   * })
   * class ClassSet {
   *   onInit() {
   *   }
   * }
   *  ```
   */
  onInit,

  /**
   * Notify a directive when the bindings of all its children have been checked (whether they have
   * changed or not).
   *
   * ## Example
   *
   * ```
   * @Directive({
   *   selector: '[class-set]',
   *   lifecycle: [LifecycleEvent.onAllChangesDone]
   * })
   * class ClassSet {
   *
   *   onAllChangesDone() {
   *   }
   *
   * }
   *  ```
   */
  onAllChangesDone
}

/**
 * Declare reusable pipe function.
 *
 * ## Example
 *
 * ```
 * @Pipe({
 *   name: 'lowercase'
 * })
 * class Lowercase {
 *   transform(v, args) { return v.toLowerCase(); }
 * }
 * ```
 */
@CONST()
export class PipeMetadata extends InjectableMetadata {
  name: string;

  constructor({name}: {name: string}) {
    super();
    this.name = name;
  }
}
