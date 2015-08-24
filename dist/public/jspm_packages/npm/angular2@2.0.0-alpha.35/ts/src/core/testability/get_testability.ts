import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';
import {global} from 'angular2/src/facade/lang';

class PublicTestability {
  _testability: Testability;

  constructor(testability: Testability) { this._testability = testability; }

  whenStable(callback: Function) { this._testability.whenStable(callback); }

  findBindings(using: any, binding: string, exactMatch: boolean): List<any> {
    return this._testability.findBindings(using, binding, exactMatch);
  }
}

export class GetTestability {
  static addToWindow(registry: TestabilityRegistry) {
    global.getAngularTestability = function(elem: Element, findInAncestors: boolean = true):
        PublicTestability {
          var testability = registry.findTestabilityInTree(elem, findInAncestors);

          if (testability == null) {
            throw new Error('Could not find testability for element.');
          }
          return new PublicTestability(testability);
        };
    global.getAllAngularTestabilities = function(): List<PublicTestability> {
      var testabilities = registry.getAllTestabilities();
      return testabilities.map((testability) => { return new PublicTestability(testability); });
    };
  }
}
