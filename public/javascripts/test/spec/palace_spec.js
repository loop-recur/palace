
var Palace = require('Palace');

describe("Palace", function() {

  it("does not globally expose functions automatically", function() {
    expect(window.emit).toBeUndefined();
  });

  describe("expose", function() {
    var cleanup = function() {
          for (f in Palace) {
            if (Palace.hasOwnProperty(f)) { 
              delete window[f];
            }
          }
        }
      ;

    beforeEach(Palace.expose);
    afterEach(cleanup);

    it("exposes all functions to the global namespace", function() {
      expect(emit).toBeDefined();
      expect(window.emit).toBeDefined();
    });

    it("omits designated functions from exposure", function() {
      expect(window.expose).toBeUndefined();
    });
  });

  describe("UI to UI Events", function() {
    var finished;

    beforeEach(function() {
      finished = false;
      Palace.expose();
    })

    it("emits arb event and calls 'on'", function() {
      fmap(function(evt){
        expect(evt.hello).toEqual('Bob');
        finished = true;
      }, on('greeting', 'div1'));

      waitsFor(function(){ return finished; });
      emit('greeting', 'div1', {hello: 'Bob'});
    });

    it("emits an arb event and returns a stream", function() {
      waitsFor(function(){ return finished; });

      fmap(function(evt) {
        expect(evt.hello).toEqual('Bob');
        finished = true;
      }, emit('greeting', 'div1', {hello: 'Bob'}));
    });

    it("emits a function event and returns a stream", function() {
      waitsFor(function(){ return finished; });

      fmap(function(result){
        expect(result).toEqual('Hi Jane');
        finished = true;
      }, emit('greet', 'div1', 'Jane'));
    });

    it("emits fn call result w/ on", function() {
      fmap(function(result) {
        expect(result).toEqual('Hi Jane');
        finished = true;
      }, emit('greet', 'div1', 'Jane'));

      waitsFor(function(){ return finished; });
    });

    it("doesn't call 'on' for the wrong events", function(){
      var wrongEvent = jasmine.createSpy();
      var wrongChannel = jasmine.createSpy();
      var rightOne = jasmine.createSpy();

      var expectation = function(evt){
        expect(wrongEvent).not.toHaveBeenCalled();
        expect(wrongChannel).not.toHaveBeenCalled();
        expect(rightOne).toHaveBeenCalled();
        finished = true;
      }

      waitsFor(function(){ return finished; });

      fmap(wrongEvent, on('greetingggg', 'div1'));
      fmap(wrongChannel, on('greeting', 'div2'));
      fmap(rightOne, on('greeting', 'div1'))
      fmap(expectation, on('greeting', 'div1'));
      emit('greeting', 'div1', {hello: 'Bob'});
    })
  });

  describe("thread to UI Events", function() {
    var finished;

    beforeEach(function() {
      finished = false;
      Palace.expose();
    });

    it("emits arb event and calls 'on'", function() {
      fmap(function(evt){
        expect(evt.hello).toEqual('Bob');
        finished = true;
      }, on('greeting', 'div2'));

      waitsFor(function(){ return finished; });
      emit('greeting', 'div2', {hello: 'Bob'});
    });

    // this doesn't work yet
    xit("emits a function event and calls 'on' with the result", function() {
      fmap(function(result) {
        expect(result).toEqual(6);
        finished = true;
      }, on('add', 'div2'));

      waitsFor(function(){ return finished; });
      emit('add', 'div2', [3,3]);
    });
  });

  describe("UI win event to win event", function() {
    var finished;

    beforeEach(function() {
      finished = false;
      Palace.expose();
    });

    it("emits an event and calls 'on'", function() {
      fmap(function(evt) {
        expect(evt.type).toEqual('click');
        finished = true;
      }, on('click', 'body'));

      waitsFor(function(){ return finished; });
      jQuery("body").trigger('click')
    });
  });
});
