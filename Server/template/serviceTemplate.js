%TestingImports%
%TestComponentFileImports%


describe('%componentName% service testing ', () => {

	
	%servicesVariable%
	
	//Define your service stub here
	%servicesStub%
	%beforeEachStart%

		TestBed.configureTestingModule({
		   providers:    [ 
							%providers% 
						 ]
		});

		
		// Services  from the root injector
		%serviceInjectors%
		%spies%

	%beforeEachEnd%
	
	%itStatements%
});