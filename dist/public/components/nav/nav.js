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
var angular2_1 = require('angular2/angular2');
var router_1 = require('angular2/router');
var api_1 = require('../../services/api');
var Nav = (function () {
    function Nav(api) {
        var _this = this;
        console.log('menu');
        this.name = 'YAY!!!!!';
        this.books = [];
        api.getBooks()
            .then(function (r) { return r.json(); })
            .then(function (r) {
            _this.books = r;
            console.log(_this.books);
        });
    }
    Nav = __decorate([
        angular2_1.Component({
            selector: 'app-nav',
            bindings: [api_1.API]
        }),
        angular2_1.View({
            templateUrl: 'components/nav/nav.html',
            directives: [router_1.RouterLink]
        }), 
        __metadata('design:paramtypes', [api_1.API])
    ], Nav);
    return Nav;
})();
exports.Nav = Nav;
