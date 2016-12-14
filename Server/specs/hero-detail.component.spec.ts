import {
    ComponentFixture,
    inject,
    TestBed
} from '@angular/core/testing';
import {
    By
} from '@angular/platform-browser';
import {
    DebugElement
} from '@angular/core';
import {
    Component,
    Input,
    OnInit
} from '@angular/core';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import 'rxjs/add/operator/pluck';
import {
    Hero
} from '../model';
import {
    HeroDetailService
} from './hero-detail.service';


describe('HeroDetailComponent', () => {

    let comp: HeroDetailComponent;
    let fixture: ComponentFixture < HeroDetailComponent > ;
    let heroDetailService: HeroDetailService;
    let route: ActivatedRoute;
    let router: Router;

    %
    debugElement %
        %
        hTMLElement %
        //Define your service stub here
        let heroDetailServiceStub = {};
    let routeStub = {};
    let routerStub = {};

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [HeroDetailComponent],
            providers: [{
                    provide: HeroDetailService,
                    useValue: heroDetailServiceStub
                }, {
                    provide: ActivatedRoute,
                    useValue: routeStub
                }, {
                    provide: Router,
                    useValue: routerStub
                }

            ]
        });

        fixture = TestBed.createComponent(HeroDetailComponent);
        comp = fixture.componentInstance;


        // Services  from the root injector
        heroDetailService = TestBed.get(HeroDetailService);
        route = TestBed.get(ActivatedRoute);
        router = TestBed.get(Router);


        .compileComponents();
    }));

    it('should execute method constructor', function() {

        var expectedValue: void; //assign expected return value
        var actualValue = comp.constructor(); //execute the method
        fixture.detectChanges();
        expect(actualValue).toBe(expectedValue); //Change your it logic accordingly
        //add more expects here
    });

    it('should execute method hero', function() {

        var expectedValue: Hero; //assign expected return value
        var actualValue = comp.hero(); //execute the method
        fixture.detectChanges();
        expect(actualValue).toBe(expectedValue); //Change your it logic accordingly
        //add more expects here
    });

    it('should execute method ngOnInit', function() {

        var expectedValue: Void; //assign expected return value
        var actualValue = comp.ngOnInit(); //execute the method
        fixture.detectChanges();
        expect(actualValue).toBe(expectedValue); //Change your it logic accordingly
        //add more expects here
    });

    it('should execute method getHero', function() {

        var id: String; //assign the value = paramValue)
        var expectedValue: Void; //assign expected return value
        var actualValue = comp.getHero(id); //execute the method
        fixture.detectChanges();
        expect(actualValue).toBe(expectedValue); //Change your it logic accordingly
        //add more expects here
    });

    it('should execute method save', function() {

        var name: String; //assign the value = paramValue)
        var phone: Number; //assign the value = paramValue)
        var expectedValue: String; //assign expected return value
        var actualValue = comp.save(name, phone); //execute the method
        fixture.detectChanges();
        expect(actualValue).toBe(expectedValue); //Change your it logic accordingly
        //add more expects here
    });

    it('should execute method cancel', function() {

        var expectedValue: void; //assign expected return value
        var actualValue = comp.cancel(); //execute the method
        fixture.detectChanges();
        expect(actualValue).toBe(expectedValue); //Change your it logic accordingly
        //add more expects here
    });

    it('should execute method gotoList', function() {

        var expectedValue: void; //assign expected return value
        var actualValue = comp.gotoList(); //execute the method
        fixture.detectChanges();
        expect(actualValue).toBe(expectedValue); //Change your it logic accordingly
        //add more expects here
    });

});