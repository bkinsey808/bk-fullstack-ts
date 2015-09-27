/// <reference path="../../../typings/angular2/angular2.d.ts" />
/// <reference path="../../../typings/angular2/router.d.ts" />
/// <reference path="../../../typings/angular2/http.d.ts" />
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
var http_1 = require('angular2/http');
var router_1 = require('angular2/router');
var header_1 = require('./header/header');
var nav_1 = require('./nav/nav');
var home_1 = require('./main/home/home');
var about_1 = require('./main/about/about');
var App = (function () {
    function App() {
        this.name = 'World';
    }
    App = __decorate([
        angular2_1.Component({
            selector: 'app'
        }),
        angular2_1.View({
            templateUrl: 'components/app.html',
            directives: [
                header_1.Header,
                nav_1.Nav,
                home_1.Home,
                about_1.About,
                router_1.ROUTER_DIRECTIVES
            ]
        }),
        router_1.RouteConfig([
            { path: '/', as: 'home', component: home_1.Home },
            { path: '/about', as: 'about', component: about_1.About }
        ]), 
        __metadata('design:paramtypes', [])
    ], App);
    return App;
})();
angular2_1.bootstrap(App, [http_1.HTTP_BINDINGS, router_1.ROUTER_BINDINGS, angular2_1.bind(router_1.LocationStrategy).toClass(router_1.HashLocationStrategy)]);
