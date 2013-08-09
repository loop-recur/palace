//+ EventName = String
//+ EventData = {}
//+ ChannelName = String
//+ @deftype Channel = {id: String, on: (EventName -> ChannelName -> EventStream), emit: -> (EventName -> ChannelName -> {} -> EventStream)}
define(['require', 'FunctionalJS', 'PreludeJS','Functor','EventStreams', 'Applicative'], function(require) {
  var Palace = {};
  var LISTENERS = {};
  var CHANNEL_REGISTRY = {};
  var GLOBAL = (typeof global == "object") ? global : window;
  var TEMPLATE_PATH = '/javascripts/src/app/templates/';
  
  // TEMPLATING
  // ====================================================
  var Render = (function() {
    var cache = {}

    //+ _getPath :: String -> String
      , _getPath = function(path) {
          return TEMPLATE_PATH+path+'.tpl';
        }

    //+ _downloadTemplateSync :: String -> Html
      , _downloadTemplateSync = function(path) {
          var request = new XMLHttpRequest();
          request.open('GET', _getPath(path), false);
          request.send(null);

          if (request.status === 200) {
            return request.responseText;
          } else {
            throw("Couldn't get template: "+path); // TODO: make this pure prob.
          }
        }
    
    //+ _getTemplate :: String -> (HandlebarsTemplate -> b)
      , _getTemplate = function(path, cb) {
          require(['text!'+_getPath(path)], compose(cb, Handlebars.compile));
        }

    /*  render: Gets a template from the server asyncronously */
    //+ render :: String -> {} -> EventStream(Html)
      , render = function(path, data) {
          var resultE = Stream();
          if(cache[path]) {
            setTimeout(function(){ resultE.sendEvent(cache[path](data)) },10);
          } else {
            _getTemplate(path, function(template){
              cache[path] = template;
              resultE.sendEvent(template(data));
            });
          }
          return resultE;
        }.autoCurry()

    /*  render_: Gets a template from the server syncronously */
    //+ render_ :: String -> {} -> Html
      , render_ = function(path, data) {
          if(cache[path]) { return cache[path](data); }
          var html = _downloadTemplateSync(path);
          var template = Handlebars.compile(html);
          cache[path] = template;
          return template(data);
        }.autoCurry();
  	
  	return {render: render, render_: render_}
  })();


  // EVENTS
  // ====================================================

  // Flapjax wrapper to keep us flexible. Was going to do more, but looks like we only use fmap, and sendEvent as the two public methods
  var Stream = function() {
    return receiverE();
  }

  var EventBus = (function() {
    var events = {}

    //+ _emitOnUIThread :: String -> ChannelName -> {}
      , _emitOnUIThread = function(name, channel_name, args) {
          return callOnUITread('emit', arguments);
        }

    //+ _getChannel :: ChannelName -> Channel
      , _getChannel = function(channel_name) {
          var channel = CHANNEL_REGISTRY[channel_name];
          if(!channel){ throw("CAN'T FIND PROCESS: "+channel_name); }
          return channel;
        }

    //+ emit :: String -> ChannelName -> EventData -> EventStream
      , emit = function(name, channel_name, data) {
          if(IS_WORKER){ return _emitOnUIThread(name, channel_name, data); }
          return _getChannel(channel_name).emit(name, data);
        }.autoCurry()

    //+ on :: String -> ChannelName -> EventStream
      , on = function(name, channel_name) {
          return _getChannel(channel_name).on(name, Stream());
        }.autoCurry()
      ;

    return {on: on, emit: emit}
  })();

  /*  postWorkerMessage: Wraps post message since it's not first class */
  //+ postWorkerMessage :: Worker -> {} -> {}
  var postWorkerMessage = function(worker, msg){
    worker.postMessage(msg);
    return msg;
  }.autoCurry();

  /*  callOnUITread: Send a message to the UI thread, setup a local listener */
  //+ callOnUITread :: String -> [a] -> EventStream
  var callOnUITread = function(fn_name, args) {
    var argz = [].slice.call(args);
    var resultE = Stream();
    (LISTENERS[argz.join('')] = LISTENERS[argz.join('')] || []).push(resultE);
    postMessage({fn_name: fn_name, data: argz});
    return resultE;
  }

  /*  uiEventHappend: This gets called from FnWorker. Ui thread sends message to worker. We look up previously setup listener from callOnUIThread */
  //+ uiEventHappend :: String -> String -> EventData
  var uiEventHappend = function(name, selector, args) {
    LISTENERS[name+selector].map(function(s){ s.sendEvent(args);});
  }

  //+ isChannel :: String -> Bool
  var isChannel = function(channel_name) {
    return !!CHANNEL_REGISTRY[channel_name];
  }

  /*  addUIOrEventListenerW: Setup on UI thread. Tells worker when  */
  //+ addUIOrEventListenerW :: String -> ChannelName|String -> Worker
  var addUIOrEventListenerW = function(event_name, channel_name_or_css_selector, worker) {
    var makeMessage = function(e){
      return { module: "Palace"
             , fn: 'uiEventHappend'
             , args: [event_name, channel_name_or_css_selector, e]
             }
    }
    if(isChannel(channel_name_or_css_selector)) {
      fmap(compose(postWorkerMessage(worker), makeMessage), addListener(event_name, channel_name_or_css_selector));
    } else {
      fmap(function(e){
        var fakeJqueryObj = { id: e.source.id
                            , outerHTML: e.source.outerHTML
                            , toElement: e.source.toElement
                            };
        var msg = {source: fakeJqueryObj, type: e.type};
        compose(postWorkerMessage(worker), makeMessage)(msg);
      }, addUIListener(event_name, channel_name_or_css_selector));
    }
  }

  //+ addUIOrEventListener :: String -> String -> EventStream
  var addUIOrEventListener = function(event_name, channel_name_or_css_selector) {
    if(IS_WORKER) {
      return callOnUITread('addUIOrEventListenerW', arguments);
    }

    if(isChannel(channel_name_or_css_selector)) {
      return addListener(event_name, channel_name_or_css_selector);
    } else {
      return addUIListener(event_name, channel_name_or_css_selector);
    }
  }

  //+ addListener :: String -> ChannelName -> EventStream
  var addListener = EventBus.on;

  //+ addUIListener :: String -> String -> EventStream
  var addUIListener = function(name, selector) {
    var resultE = Stream();

    // TODO: global events on document ain't gonna fly.
    // We do this because this is added before dom on a string from a thread
    jQuery(document).on(name, selector, function(e){
      e.source = e.target;
      resultE.sendEvent(e);
    });
    return resultE;
  }

  var emit = function(name, channel_name, data) {
    return EventBus.emit(name, channel_name, data);
  }.autoCurry();

  //+ placeOnScreen :: {selector: String, html: String}
  var placeOnScreen = function(e){
    if(IS_WORKER) return callOnUITread('placeOnScreen', arguments);
    if(e.html) $(e.selector).html(e.html);
    if(e.replace) $(e.selector).replaceWith(e.replace);
  }

  /*  makeWorker: starts a webworker with a local event stream to communicate with it */
  //+ makeWorker :: String -> String -> [a]
  var makeWorker = function(name, fn_name, args) {
    var worker = new Worker(APP_PATH+'/lib/FunctionWorker.js');
    worker.addEventListener('message', function(event) {
      var e = event.data;

      // log from worker
      if(e.log) return console.log("LOG "+fn_name, e.log);

      // call a function on a ui thread.
      if(e.fn_name) {
        return Palace[e.fn_name].apply(null, e.data.concat(worker));
      }
    }, false);

    // start worker
    worker.postMessage({module: name, fn: fn_name, args: args});
    return worker;
  }.autoCurry();

  //+ makeChannel :: ChannelName -> {} -> Channel
  var makeChannel = function(name, process) {
    var events = {}

      , onE = function(name, es) {
          events[name] = events[name] || [];
          events[name].push(es);
          return es;
        }.autoCurry()

      , _notifyOthers = function(n, r) {
          return map(function(es){ es.sendEvent(r); }, (events[n] || []));
        }.autoCurry()

      , _runFun = function(fn_name, args) {
          var resultE = Stream();
          var result = process[fn_name](args);
          // is it a stream?
          (result && result.updater) ? fmap(_notifyOthers(fn_name), result) : _notifyOthers(fn_name, result);

          // emitting to immediate function must have same semantics so treat like callback
          setTimeout(function(){ resultE.sendEvent(result) },1);
          return resultE;
        }.autoCurry()

        //1. emit some arb evt to channel (name)
        //2. run a function and return a stream of result
      , emitE = function(name, data) {
          if(process[name]) { return _runFun(name, data) }
          var resultE = Stream();
          onE(name, resultE); //add self
          _notifyOthers(name, data);
          setTimeout(function(){ resultE.sendEvent(data) }, 1);
          return resultE;
        }.autoCurry();

    // this should be a wrapper for a worker w/ emit and junk
    return {on: onE, emit: emitE, id: name};
  }

  /*  register: takes a string and some fn/obj to emit events to */
  //+ register :: String -> {} -> Channel
  var register = function(name, obj) {
    obj = (obj || {});
    CHANNEL_REGISTRY[name] = obj.emit ? obj : makeChannel(name, obj);
    return CHANNEL_REGISTRY[name];
  }

  /*  spawn: kicks off actor on a new worker thread */
  //+ spawn :: String -> (a -> b) -> [a] -> Channel
  var spawn = function(name, fn_name, args) {
    var worker = makeWorker(name, fn_name, args);
    return makeChannel(fn_name, worker);
  }.autoCurry();

  /*  startController: Finds a view of the same name, renders it, then calls
      the function with it and the args
  */  
  //+ startController :: String -> {} -> Channel
  var startController = function(name, args) {
    var args = args || {}
    var view_of_same_name = Render.render(name, {});
    var fn = GLOBAL[name];
    fmap(function(view) { fn(view, args); }, view_of_same_name);
    return makeChannel(name, {}); // make a process to represent this controller
  }


  // JQUERY REPLACMENT
  // This needs a crapload of work. We're on workers so we have no dom
  // On the bright side it's justification for a more functional jQuery api
  // ========================================================

  var grab = function(doc,el){
      return $(el, doc);
    }  
    , html = function(full_id, doc, h){
        var sel = full_id.replace('#', '');
        return doc.replace(RegExp('(id="'+sel+'".*\>(.*)?<)'), function(m){ return m.replace(/<$/, '')+h+'<'; });
      }.autoCurry()
    , click = function(fn, el){ return el.click(fn); }.autoCurry()
    , append = function(el, doc, h) {
        if(h.join) h = h.join(""); // [] || ""
        return (doc || "").replace(RegExp('<'+el+'(.*)'), function(m){ return m+h; });
      }.autoCurry()
    , css = function(style, el) {
        $(el).css(style);
        return $(el)[0];
      }.autoCurry()
    , on = function(event_name, channel_name_or_css_selector) {
        return addUIOrEventListener(event_name, channel_name_or_css_selector)
      }.autoCurry()
    , updateHtml = function(selector, html) {
        return placeOnScreen({selector: selector, html: html})
      }.autoCurry()
    ;


  // EXPORTING
  // ========================================================
  
  Palace = { render: Render.render
           , render_: Render.render_
           , grab: grab
           , html: html
           , updateHtml: updateHtml
           , append: append
           , css: css
           , click: click
           , on: on
           , emit: emit
           , startController: startController
           , spawn: spawn
           , register: register
           , uiEventHappend: uiEventHappend
           , placeOnScreen: placeOnScreen
           , addUIOrEventListener: addUIOrEventListener
           , addUIOrEventListenerW: addUIOrEventListenerW
           };
  
  Palace.expose = function expose(env) {
    var fn;                             
    if(!env) {
      env = (typeof global == "object") ? global : window;
    }
    
    for (fn in Palace) {
      if (fn !== 'expose' && Palace.hasOwnProperty(fn)) {
        env[fn] = Palace[fn];
      }
    }
  };

  return Palace;
});
