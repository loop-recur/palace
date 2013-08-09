require.config( {
	paths : {
	  	Handlebars: '../vendor/handlebars/1.0.5/handlebars'
	  , jasmine: '../test/lib/jasmine-1.2.0/jasmine'
	  , jasmineHtml: '../test/lib/jasmine-1.2.0/jasmine-html'
	  , SpecHelper: '../test/spec/SpecHelper'
	  , palaceSpec: '../test/spec/palace_spec'
	  , text: '../vendor/require/plugins/text'
	  , Palace:  '../vendor/palace/0.1/palace'
	  , FlapJax: '../vendor/flapjax'
    , FunctionalJS: '../vendor/FunctionalJS/functional'
    , PreludeJS: '../vendor/PreludeJS/prelude'
    , Typeclasses: '../vendor/typeclasses/support/types'
    , Functor: '../vendor/typeclasses/functor'
    , Applicative: '../vendor/typeclasses/applicative'
    , Monad: '../vendor/typeclasses/monad'
	  , EventStreams: '../vendor/typeclasses/eventstreams'
	},
    shim: {
        	'Handlebars': {
            exports: 'Handlebars'
        	}
      	, 'PreludeJS': {
						deps: ['FunctionalJS']
        	}
				, 'Typeclasses': {
						deps: ['FunctionalJS']
	        }
	      , 'Functor': {
						deps: ['Typeclasses']
	        }
        , 'Applicative': {
						deps: ['Typeclasses']
       	 }
				, 'Monad': {
						deps: ['Functor']
        	}
				, 'EventStreams': {
						deps: ['FlapJax', 'Functor', 'Monad']
    		}
    		, 'jasmineHtml' : {
    				deps: ['jasmine']
    			}
    		, 'jasmine' : {
    				exports: 'jasmine'
    			}
    		, 'palaceSpec': {
    				deps: ['Palace']
    			}
    	}
});

require({baseUrl: MAIN_PATH },
	[
			'require'
		, 'jasmine'
		, 'Palace'
		, 'jasmineHtml'
		, 'SpecHelper'
		, 'palaceSpec'
		, 'FunctionalJS'
		, 'PreludeJS'
		, 'FlapJax'
		, 'EventStreams'
		, 'Handlebars'
		, 'Palace'
		, 'Typeclasses'
		, 'Functor'
		, 'Monad'
		, 'text'
	],
	function(require, jasmine, Palace){
    IS_WORKER = !(typeof document.cookie == 'string'); //hack
    if(!IS_WORKER) startApp(Palace); // test app in spec helper

    // START JASMINE
    // =================
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
      return htmlReporter.specFilter(spec);
    };

    var currentWindowOnload = window.onload;

    window.onload = function() {
      if (currentWindowOnload) {
        currentWindowOnload();
      }
      execJasmine();
    };

    function execJasmine() {
      jasmineEnv.execute();
    }
});
