module.exports = function(socket){
	SocketController = require('./socket_controller')(socket);
  socket.on('car_stat_update', SocketController.index);
	socket.on('request_configs', SocketController.getConfigs);
  socket.on('getCurrentData', SocketController.submitCurrentStats);
};
