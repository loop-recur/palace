IS_TEST = false; //blah hack to deal with tests for now.
id = function(x){ return x; }
console = {log: function(x){ postMessage({log: JSON.stringify(x)}); }}
MAIN_PATH = "/javascripts/javascripts/" //goofy
APP_PATH = '/javascripts/src/app';

importScripts("/javascripts/vendor/require/2.0.2/require.js");
importScripts("/javascripts/"+(IS_TEST ? 'test' : 'src')+"/main.js");

require({
        baseUrl: "./"
    },
    ["require", 'Palace'],
    function(require, Palace) {
        onmessage = function(evt){ 
        	var data = evt.data;
        	// usually it's a function we're starting, but sometimes it's an event listener
            // TODO: make this cleaner...
        	if(data.module) {
                if(data.module == "global") {
                  self[data.fn].apply(self, data.args);
                } else {
                  self[data.module][data.fn].apply(self, data.args);
                }
        	}
		}
    }
);
