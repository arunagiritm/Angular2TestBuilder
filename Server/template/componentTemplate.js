%TestingImports%
%PlatformBrowserImports%
%CoreImports%
%TestComponentFileImports%


describe('%componentName%', () => {

	let comp: %componentName%;
	let fixture: ComponentFixture<%componentName%>;
	%servicesVariable%
	%debugElement%
	%hTMLElement%
	//Define your service stub here
	%servicesStub%
	%beforeEachStart%

		TestBed.configureTestingModule({
		   declarations: [ %componentName% ],
		   providers:    [ 
							%providers% 
						 ]
		})%beforeEachEnd%;

		fixture = TestBed.createComponent(%componentName%);
		comp    = fixture.componentInstance;


		// Services  from the root injector
		%serviceInjectors%
		%spies%

	
	
	%itStatements%
});