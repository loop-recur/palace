require.config( {
	paths : {
	  	Handlebars: '/javascripts/vendor/handlebars/1.0.5/handlebars'
	  , text: '/javascripts/vendor/require/plugins/text'
	  , Palace:  '/javascripts/vendor/palace/0.1/palace'
	  , FlapJax: '/javascripts/vendor/flapjax'
    , FunctionalJS: '/javascripts/vendor/FunctionalJS/functional'
    , PreludeJS: '/javascripts/vendor/PreludeJS/prelude'
    , Typeclasses: '/javascripts/vendor/typeclasses/support/types'
    , Functor: '/javascripts/vendor/typeclasses/functor'
    , Applicative: '/javascripts/vendor/typeclasses/applicative'
    , Monad: '/javascripts/vendor/typeclasses/monad'
	  , EventStreams: '/javascripts/vendor/typeclasses/eventstreams'
	  , Blog: '/javascripts/src/app/controllers/Blog'
	  , Post: '/javascripts/src/app/controllers/Post'
	  , PostList: '/javascripts/src/app/controllers/PostList'
	  , Likes: '/javascripts/src/app/controllers/Likes'
	  , Comments: '/javascripts/src/app/controllers/Comments'
	  , Socket: '/javascripts/src/app/lib/Socket'
	  , Http: '/javascripts/src/app/lib/Http'
	  , Repo: '/javascripts/src/app/lib/Repo'
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
      	, 'Socket' : {
	      			deps: ['Palace']
	      		, exports: 'Socket'
	      	}
      	, 'Http' : {
	      			deps: ['Palace']
  	    		, exports: 'Http'
  	    	}
  	    , 'Repo': {
  	    			deps: ['Http', 'Socket']
  	    		, exports: 'Repo'
  	    	}
        , 'Blog' : {
        			deps: ['Palace', 'Socket', 'Repo', 'PostList', 'Post', 'Comments', 'Likes']
        		, exports: "Blog"
        	}
				, 'PostList' : {
        			deps: ['Palace']
        		, exports: 'PostList'
        	}
				, 'Post' : {
        			deps: ['Palace']
        		, exports: 'Post'
        	}
				, 'Comments' : {
        			deps: ['Palace']
        		, exports: 'Comments'
        	}
				, 'Likes' : {
        			deps: ['Palace']
        		, exports: 'Likes'
        	}
    	}
});

require({baseUrl: "/javascripts/src/" },
	[
			'require'
		, 'Blog'
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
	function(require, Blog, FunctionalJS, PreludeJS, FlapJax, EventStreams, Handlebars, Palace, Typeclasses, Functor, Monad){
		PreludeJS.expose();
		IS_WORKER = !(typeof document.cookie == 'string'); //hack
		if(!IS_WORKER) Blog();
});
