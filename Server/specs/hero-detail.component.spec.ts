import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/pluck';
import { Hero } from '../model';
import { HeroDetailService } from './hero-detail.service';


describe('HeroDetailComponent', () => {

    let comp: HeroDetailComponent;
    let fixture: ComponentFixture < HeroDetailComponent > ;
    let heroDetailService: HeroDetailService;
    let route: ActivatedRoute;
    let router: Router;



    //Define your service stub here
    let heroDetailServiceStub = {};
    let routeStub = {};
    let routerStub = {};

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [HeroDetailComponent],
            providers: [
                /*
uncomment these lines if you want to use the service, instead of mock
,HeroDetailService
,ActivatedRoute
,Router
,*/
                , {
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

        //Spies
        /* uncomment these lines if you want to use spies
        //Use returnValue method of spy to return your mock data.
        //Use callThrough method of spy to call the actual method

        spyOn(HeroDetailService,methodName) // replace the methodName with the actual method of the service. 

        spyOn(ActivatedRoute,methodName) // replace the methodName with the actual method of the service. 

        spyOn(Router,methodName) // replace the methodName with the actual method of the service. 

        */


        .compileComponents();
    }));

    //Input Properties validation
    it('should set the component input properties for hero', function() {

        var expectedValue: Hero; //assign expected return value
        var actualValue;
        comp.hero = value //set the value here
        fixture.detectChanges();
        let el = fixture.debugElement.query(By.css('css selector')).nativeElement;
        expect(el).toBe(expectedValue, 'The actual value is not matching the expected value');
    });

    it('should instantiate HeroDetailComponent ', () => {
        expect(fixture.componentInstance instanceof HeroDetailComponent).toBe(true, 'could not create HeroDetailComponent');
    });

    it('should execute method ngOnInit', function() {

        var expectedValue: Void; //assign expected return value
        var actualValue = comp.ngOnInit(); //execute the method
        fixture.detectChanges();
        expect(actualValue).toBe(expectedValue); //Change your it logic accordingly
        //add more expects here
    });

    it('should execute method getHero', function() {

        var expectedValue: Void; //assign expected return value
        var actualValue = comp.getHero(id); //execute the method
        fixture.detectChanges();
        expect(actualValue).toBe(expectedValue); //Change your it logic accordingly
        //add more expects here
    });

    it('should execute method save', function() {

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