(function() {
  Functor(EventStream, {
    fmap: function(f) {
      return this.mapE(f);
    }
  });  

  Monad(EventStream, {
    mjoin: function() {
      // propagatePulse(new Pulse(nextStamp(), value),node);
      // var val = this.updater([10])
      // console.log("val")
      // console.log(val)
      // new EventStream([this], K(val))
      var val = null;
      this.mapE(function(e){
        val = e
      });
      return val;
    }
  });  
})()
