var Socket = (function(){
  var create = function(host) {
    var socket = io.connect(host)

    	, onE = function(name) {
	      	var resultE = receiverE();
	      	socket.on(name, function(e){ resultE.sendEvent(e); });
	      	return resultE;
	      }

    	, emitE = function(name, data) {
	      	socket.emit(name, data)
	      }.autoCurry()
	    ;

    return {on: onE, emit: emitE}
  }


  return {create: create}
})();
