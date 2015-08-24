/* */ 
"format cjs";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PromiseWrapper } from 'angular2/src/facade/async';
import { Injectable } from 'angular2/di';
/**
 * Responsible for performing each step of navigation.
 * "Steps" are conceptually similar to "middleware"
 */
export let Pipeline = class {
    constructor() {
        this.steps = [instruction => instruction.router.activateOutlets(instruction)];
    }
    process(instruction) {
        var steps = this.steps, currentStep = 0;
        function processOne(result = true) {
            if (currentStep >= steps.length) {
                return PromiseWrapper.resolve(result);
            }
            var step = steps[currentStep];
            currentStep += 1;
            return PromiseWrapper.resolve(step(instruction)).then(processOne);
        }
        return processOne();
    }
};
Pipeline = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], Pipeline);
//# sourceMappingURL=pipeline.js.map