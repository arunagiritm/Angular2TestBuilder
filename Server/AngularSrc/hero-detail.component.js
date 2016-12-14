"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
require('rxjs/add/operator/pluck');
var model_1 = require('../model');
var hero_detail_service_1 = require('./hero-detail.service');
var HeroDetailComponent = (function () {
    function HeroDetailComponent(heroDetailService, route, router) {
        this.heroDetailService = heroDetailService;
        this.route = route;
        this.router = router;
    }
    HeroDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
       
        this.route.params.pluck('id')
            .forEach(function (id) { return _this.getHero(id); })
            .catch(function () { return _this.hero = new model_1.Hero(); });
    };
    HeroDetailComponent.prototype.getHero = function (id) {
        var _this = this;
        this.heroDetailService.getHero(id).then(function (hero) {
            if (hero) {
                _this.hero = hero;
            }
            else {
                _this.gotoList();
            }
        });
    };
    HeroDetailComponent.prototype.save = function (name, phone) {
        var _this = this;
        this.heroDetailService.saveHero(this.hero).then(function () { return _this.gotoList(); });
        return "";
    };
    HeroDetailComponent.prototype.cancel = function () { this.gotoList(); };
    HeroDetailComponent.prototype.gotoList = function () {
        this.router.navigate(['../'], { relativeTo: this.route });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', (typeof (_a = typeof model_1.Hero !== 'undefined' && model_1.Hero) === 'function' && _a) || Object)
    ], HeroDetailComponent.prototype, "hero", void 0);
    HeroDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'app-hero-detail',
            templateUrl: 'hero-detail.component.html',
            styleUrls: ['hero-detail.component.css', 'abc'],
            providers: [hero_detail_service_1.HeroDetailService]
        }), 
        __metadata('design:paramtypes', [(typeof (_b = typeof hero_detail_service_1.HeroDetailService !== 'undefined' && hero_detail_service_1.HeroDetailService) === 'function' && _b) || Object, (typeof (_c = typeof router_1.ActivatedRoute !== 'undefined' && router_1.ActivatedRoute) === 'function' && _c) || Object, (typeof (_d = typeof router_1.Router !== 'undefined' && router_1.Router) === 'function' && _d) || Object])
    ], HeroDetailComponent);
    return HeroDetailComponent;
    var _a, _b, _c, _d;
}());
exports.HeroDetailComponent = HeroDetailComponent;
 