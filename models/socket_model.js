SocketModel = (function(){
	var sayHi = function(){
		console.log
	}
	return  { say_hi: sayHi, 
		another: function(){
		}}
})();

SocketModel.say_hi;