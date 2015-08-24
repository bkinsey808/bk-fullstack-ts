import {isPresent, isBlank, RegExpWrapper} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {List, Map, MapWrapper, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';
import {ASTWithSource} from 'angular2/src/change_detection/change_detection';

/**
 * General notes:
 *
 * The methods for creating / destroying views in this API are used in the AppViewHydrator
 * and RenderViewHydrator as well.
 *
 * We are already parsing expressions on the render side:
 * - this makes the ElementBinders more compact
 *   (e.g. no need to distinguish interpolations from regular expressions from literals)
 * - allows to retrieve which properties should be accessed from the event
 *   by looking at the expression
 * - we need the parse at least for the `template` attribute to match
 *   directives in it
 * - render compiler is not on the critical path as
 *   its output will be stored in precompiled templates.
 */

export class EventBinding {
  constructor(public fullName: string, public source: ASTWithSource) {}
}

export enum PropertyBindingType {
  PROPERTY,
  ATTRIBUTE,
  CLASS,
  STYLE
}

export class ElementPropertyBinding {
  constructor(public type: PropertyBindingType, public astWithSource: ASTWithSource,
              public property: string, public unit: string = null) {}
}

export class RenderElementBinder {
  index: number;
  parentIndex: number;
  distanceToParent: number;
  directives: List<DirectiveBinder>;
  nestedProtoView: ProtoViewDto;
  propertyBindings: List<ElementPropertyBinding>;
  variableBindings: Map<string, string>;
  // Note: this contains a preprocessed AST
  // that replaced the values that should be extracted from the element
  // with a local name
  eventBindings: List<EventBinding>;
  readAttributes: Map<string, string>;

  constructor({index, parentIndex, distanceToParent, directives, nestedProtoView, propertyBindings,
               variableBindings, eventBindings, readAttributes}: {
    index?: number,
    parentIndex?: number,
    distanceToParent?: number,
    directives?: List<DirectiveBinder>,
    nestedProtoView?: ProtoViewDto,
    propertyBindings?: List<ElementPropertyBinding>,
    variableBindings?: Map<string, string>,
    eventBindings?: List<EventBinding>,
    readAttributes?: Map<string, string>
  } = {}) {
    this.index = index;
    this.parentIndex = parentIndex;
    this.distanceToParent = distanceToParent;
    this.directives = directives;
    this.nestedProtoView = nestedProtoView;
    this.propertyBindings = propertyBindings;
    this.variableBindings = variableBindings;
    this.eventBindings = eventBindings;
    this.readAttributes = readAttributes;
  }
}

export class DirectiveBinder {
  // Index into the array of directives in the View instance
  directiveIndex: number;
  propertyBindings: Map<string, ASTWithSource>;
  // Note: this contains a preprocessed AST
  // that replaced the values that should be extracted from the element
  // with a local name
  eventBindings: List<EventBinding>;
  hostPropertyBindings: List<ElementPropertyBinding>;
  constructor({directiveIndex, propertyBindings, eventBindings, hostPropertyBindings}: {
    directiveIndex?: number,
    propertyBindings?: Map<string, ASTWithSource>,
    eventBindings?: List<EventBinding>,
    hostPropertyBindings?: List<ElementPropertyBinding>
  }) {
    this.directiveIndex = directiveIndex;
    this.propertyBindings = propertyBindings;
    this.eventBindings = eventBindings;
    this.hostPropertyBindings = hostPropertyBindings;
  }
}

export enum ViewType {
  // A view that contains the host element with bound component directive.
  // Contains a COMPONENT view
  HOST,
  // The view of the component
  // Can contain 0 to n EMBEDDED views
  COMPONENT,
  // A view that is embedded into another View via a <template> element
  // inside of a COMPONENT view
  EMBEDDED
}

export class ProtoViewDto {
  render: RenderProtoViewRef;
  elementBinders: List<RenderElementBinder>;
  variableBindings: Map<string, string>;
  type: ViewType;
  textBindings: List<ASTWithSource>;
  transitiveNgContentCount: number;

  constructor({render, elementBinders, variableBindings, type, textBindings,
               transitiveNgContentCount}: {
    render?: RenderProtoViewRef,
    elementBinders?: List<RenderElementBinder>,
    variableBindings?: Map<string, string>,
    type?: ViewType,
    textBindings?: List<ASTWithSource>,
    transitiveNgContentCount?: number
  }) {
    this.render = render;
    this.elementBinders = elementBinders;
    this.variableBindings = variableBindings;
    this.type = type;
    this.textBindings = textBindings;
    this.transitiveNgContentCount = transitiveNgContentCount;
  }
}

export class RenderDirectiveMetadata {
  static get DIRECTIVE_TYPE() { return 0; }
  static get COMPONENT_TYPE() { return 1; }
  id: any;
  selector: string;
  compileChildren: boolean;
  events: List<string>;
  properties: List<string>;
  readAttributes: List<string>;
  type: number;
  callOnDestroy: boolean;
  callOnChange: boolean;
  callOnCheck: boolean;
  callOnInit: boolean;
  callOnAllChangesDone: boolean;
  changeDetection: string;
  exportAs: string;
  hostListeners: Map<string, string>;
  hostProperties: Map<string, string>;
  hostAttributes: Map<string, string>;
  hostActions: Map<string, string>;
  // group 1: "property" from "[property]"
  // group 2: "event" from "(event)"
  // group 3: "action" from "@action"
  private static _hostRegExp = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\))|(?:@(.+)))$/g;

  constructor({id, selector, compileChildren, events, hostListeners, hostProperties, hostAttributes,
               hostActions, properties, readAttributes, type, callOnDestroy, callOnChange,
               callOnCheck, callOnInit, callOnAllChangesDone, changeDetection, exportAs}: {
    id?: string,
    selector?: string,
    compileChildren?: boolean,
    events?: List<string>,
    hostListeners?: Map<string, string>,
    hostProperties?: Map<string, string>,
    hostAttributes?: Map<string, string>,
    hostActions?: Map<string, string>,
    properties?: List<string>,
    readAttributes?: List<string>,
    type?: number,
    callOnDestroy?: boolean,
    callOnChange?: boolean,
    callOnCheck?: boolean,
    callOnInit?: boolean,
    callOnAllChangesDone?: boolean,
    changeDetection?: string,
    exportAs?: string
  }) {
    this.id = id;
    this.selector = selector;
    this.compileChildren = isPresent(compileChildren) ? compileChildren : true;
    this.events = events;
    this.hostListeners = hostListeners;
    this.hostAttributes = hostAttributes;
    this.hostProperties = hostProperties;
    this.hostActions = hostActions;
    this.properties = properties;
    this.readAttributes = readAttributes;
    this.type = type;
    this.callOnDestroy = callOnDestroy;
    this.callOnChange = callOnChange;
    this.callOnCheck = callOnCheck;
    this.callOnInit = callOnInit;
    this.callOnAllChangesDone = callOnAllChangesDone;
    this.changeDetection = changeDetection;
    this.exportAs = exportAs;
  }

  static create({id, selector, compileChildren, events, host, properties, readAttributes, type,
                 callOnDestroy, callOnChange, callOnCheck, callOnInit, callOnAllChangesDone,
                 changeDetection, exportAs}: {
    id?: string,
    selector?: string,
    compileChildren?: boolean,
    events?: List<string>,
    host?: Map<string, string>,
    properties?: List<string>,
    readAttributes?: List<string>,
    type?: number,
    callOnDestroy?: boolean,
    callOnChange?: boolean,
    callOnCheck?: boolean,
    callOnInit?: boolean,
    callOnAllChangesDone?: boolean,
    changeDetection?: string,
    exportAs?: string
  }): RenderDirectiveMetadata {
    let hostListeners = new Map();
    let hostProperties = new Map();
    let hostAttributes = new Map();
    let hostActions = new Map();

    if (isPresent(host)) {
      MapWrapper.forEach(host, (value: string, key: string) => {
        var matches = RegExpWrapper.firstMatch(RenderDirectiveMetadata._hostRegExp, key);
        if (isBlank(matches)) {
          hostAttributes.set(key, value);
        } else if (isPresent(matches[1])) {
          hostProperties.set(matches[1], value);
        } else if (isPresent(matches[2])) {
          hostListeners.set(matches[2], value);
        } else if (isPresent(matches[3])) {
          hostActions.set(matches[3], value);
        }
      });
    }

    return new RenderDirectiveMetadata({
      id: id,
      selector: selector,
      compileChildren: compileChildren,
      events: events,
      hostListeners: hostListeners,
      hostProperties: hostProperties,
      hostAttributes: hostAttributes,
      hostActions: hostActions,
      properties: properties,
      readAttributes: readAttributes,
      type: type,
      callOnDestroy: callOnDestroy,
      callOnChange: callOnChange,
      callOnCheck: callOnCheck,
      callOnInit: callOnInit,
      callOnAllChangesDone: callOnAllChangesDone,
      changeDetection: changeDetection,
      exportAs: exportAs
    });
  }
}

// An opaque reference to a render proto ivew
export class RenderProtoViewRef {}

// An opaque reference to a part of a view
export class RenderFragmentRef {}

// An opaque reference to a view
export class RenderViewRef {}

/**
 * How the template and styles of a view should be encapsulated.
 */
export enum ViewEncapsulation {
  /**
   * Emulate scoping of styles by preprocessing the style rules
   * and adding additional attributes to elements. This is the default.
   */
  EMULATED,
  /**
   * Uses the native mechanism of the renderer. For the DOM this means creating a ShadowRoot.
   */
  NATIVE,
  /**
   * Don't scope the template nor the styles.
   */
  NONE
}

export class ViewDefinition {
  componentId: string;
  templateAbsUrl: string;
  template: string;
  directives: List<RenderDirectiveMetadata>;
  styleAbsUrls: List<string>;
  styles: List<string>;
  encapsulation: ViewEncapsulation;

  constructor({componentId, templateAbsUrl, template, styleAbsUrls, styles, directives,
               encapsulation}: {
    componentId?: string,
    templateAbsUrl?: string,
    template?: string,
    styleAbsUrls?: List<string>,
    styles?: List<string>,
    directives?: List<RenderDirectiveMetadata>,
    encapsulation?: ViewEncapsulation
  } = {}) {
    this.componentId = componentId;
    this.templateAbsUrl = templateAbsUrl;
    this.template = template;
    this.styleAbsUrls = styleAbsUrls;
    this.styles = styles;
    this.directives = directives;
    this.encapsulation = isPresent(encapsulation) ? encapsulation : ViewEncapsulation.EMULATED;
  }
}

export class RenderProtoViewMergeMapping {
  constructor(public mergedProtoViewRef: RenderProtoViewRef,
              // Number of fragments in the merged ProtoView.
              // Fragments are stored in depth first order of nested ProtoViews.
              public fragmentCount: number,
              // Mapping from app element index to render element index.
              // Mappings of nested ProtoViews are in depth first order, with all
              // indices for one ProtoView in a consecuitve block.
              public mappedElementIndices: number[],
              // Number of bound render element.
              // Note: This could be more than the original ones
              // as we might have bound a new element for projecting bound text nodes.
              public mappedElementCount: number,
              // Mapping from app text index to render text index.
              // Mappings of nested ProtoViews are in depth first order, with all
              // indices for one ProtoView in a consecuitve block.
              public mappedTextIndices: number[],
              // Mapping from view index to app element index
              public hostElementIndicesByViewIndex: number[],
              // Number of contained views by view index
              public nestedViewCountByViewIndex: number[]) {}
}

export class RenderCompiler {
  /**
   * Creats a ProtoViewDto that contains a single nested component with the given componentId.
   */
  compileHost(directiveMetadata: RenderDirectiveMetadata): Promise<ProtoViewDto> { return null; }

  /**
   * Compiles a single DomProtoView. Non recursive so that
   * we don't need to serialize all possible components over the wire,
   * but only the needed ones based on previous calls.
   */
  compile(view: ViewDefinition): Promise<ProtoViewDto> { return null; }

  /**
   * Merges ProtoViews.
   * The first entry of the array is the protoview into which all the other entries of the array
   * should be merged.
   * If the array contains other arrays, they will be merged before processing the parent array.
   * The array must contain an entry for every component and embedded ProtoView of the first entry.
   * @param protoViewRefs List of ProtoViewRefs or nested
   * @return the merge result
   */
  mergeProtoViewsRecursively(
      protoViewRefs: List<RenderProtoViewRef | List<any>>): Promise<RenderProtoViewMergeMapping> {
    return null;
  }
}

export class RenderViewWithFragments {
  constructor(public viewRef: RenderViewRef, public fragmentRefs: RenderFragmentRef[]) {}
}

/**
 * Abstract reference to the element which can be marshaled across web-worker boundary.
 *
 * This interface is used by the Renderer API.
 */
export interface RenderElementRef {
  /**
   * Reference to the `RenderViewRef` where the `RenderElementRef` is inside of.
   */
  renderView: RenderViewRef;
  /**
   * Index of the element inside the `RenderViewRef`.
   *
   * This is used internally by the Angular framework to locate elements.
   */
  renderBoundElementIndex: number;
}

export class Renderer {
  /**
   * Creates a root host view that includes the given element.
   * Note that the fragmentCount needs to be passed in so that we can create a result
   * synchronously even when dealing with webworkers!
   *
   * @param {RenderProtoViewRef} hostProtoViewRef a RenderProtoViewRef of type
   * ProtoViewDto.HOST_VIEW_TYPE
   * @param {any} hostElementSelector css selector for the host element (will be queried against the
   * main document)
   * @return {RenderViewWithFragments} the created view including fragments
   */
  createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number,
                     hostElementSelector: string): RenderViewWithFragments {
    return null;
  }

  /**
   * Creates a regular view out of the given ProtoView.
   * Note that the fragmentCount needs to be passed in so that we can create a result
   * synchronously even when dealing with webworkers!
   */
  createView(protoViewRef: RenderProtoViewRef, fragmentCount: number): RenderViewWithFragments {
    return null;
  }

  /**
   * Destroys the given view after it has been dehydrated and detached
   */
  destroyView(viewRef: RenderViewRef) {}

  /**
   * Attaches a fragment after another fragment.
   */
  attachFragmentAfterFragment(previousFragmentRef: RenderFragmentRef,
                              fragmentRef: RenderFragmentRef) {}

  /**
   * Attaches a fragment after an element.
   */
  attachFragmentAfterElement(elementRef: RenderElementRef, fragmentRef: RenderFragmentRef) {}

  /**
   * Detaches a fragment.
   */
  detachFragment(fragmentRef: RenderFragmentRef) {}

  /**
   * Hydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  hydrateView(viewRef: RenderViewRef) {}

  /**
   * Dehydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  dehydrateView(viewRef: RenderViewRef) {}

  /**
   * Returns the native element at the given location.
   * Attention: In a WebWorker scenario, this should always return null!
   */
  getNativeElementSync(location: RenderElementRef): any { return null; }

  /**
   * Sets a property on an element.
   */
  setElementProperty(location: RenderElementRef, propertyName: string, propertyValue: any) {}

  /**
   * Sets an attribute on an element.
   */
  setElementAttribute(location: RenderElementRef, attributeName: string, attributeValue: string) {}

  /**
   * Sets a class on an element.
   */
  setElementClass(location: RenderElementRef, className: string, isAdd: boolean) {}

  /**
   * Sets a style on an element.
   */
  setElementStyle(location: RenderElementRef, styleName: string, styleValue: string) {}

  /**
   * Calls a method on an element.
   */
  invokeElementMethod(location: RenderElementRef, methodName: string, args: List<any>) {}

  /**
   * Sets the value of a text node.
   */
  setText(viewRef: RenderViewRef, textNodeIndex: number, text: string) {}

  /**
   * Sets the dispatcher for all events of the given view
   */
  setEventDispatcher(viewRef: RenderViewRef, dispatcher: RenderEventDispatcher) {}
}


/**
 * A dispatcher for all events happening in a view.
 */
export interface RenderEventDispatcher {
  /**
   * Called when an event was triggered for a on-* attribute on an element.
   * @param {Map<string, any>} locals Locals to be used to evaluate the
   *   event expressions
   */
  dispatchRenderEvent(elementIndex: number, eventName: string, locals: Map<string, any>);
}
