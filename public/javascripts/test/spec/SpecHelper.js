
// This is our app.
var App = {};

App.Div1 = function() {
  var greet = function(name) { return "Hi "+name }
  return {greet: greet}
};

// public so we can spawn
App.Div2 = function() {
  var add = function(x,y) { return x + y }
  fmap(function(e){ console.log("EEEE"+e); Div2.e = e;}, Palace.on('body', 'click'))
  return {add: add}
};

// Only run if not on worker
var startApp = function(Palace) {
  Palace.register('div1', App.Div1());
  Palace.register('div2', Palace.spawn('App', 'Div2', []));
}
