SocketController = function(socket){
	
	var _allConfigsAsJson = function(){
		var fs = require('fs')
			, configs = {}
			, dir = __dirname + "/../car_stat_config_files";
		var filenames = fs.readdirSync(dir)
		for(var i=0, fname; fname=filenames[i]; i++){
			var config_name = fname.split('.')[0];
			var raw_data = fs.readFileSync(dir + '/' + fname, 'utf8');
			configs[config_name] = JSON.parse(raw_data);
		}
		return configs;
	};

 	index = function(data){
		console.log(data);
		socket.broadcast.emit("car_stats_received", data);
	};
	
	getConfigs = function(){
		console.log("getConfigs is called!");
		socket.emit("quick_configs", _allConfigsAsJson());
	};
	
	startRunningConfig = function(){
		console.log("starRunningConfig Called!");
		var all_configs = _allConfigsAsJson()
			, data;
		data = all_configs.low;
		console.log("all_configs", all_configs, "data", data);
		socket.emit("update_config_from_server", data);
	};

  submitCurrentStats = function() {
    socket.broadcast.emit('getDataFields');
  };

	// Clear timeouts
	stopRunningConfig = function(){
		
	};
	
	return {index: index, getConfigs: getConfigs, startRunningConfig: startRunningConfig, stopRunningConfig: stopRunningConfig, submitCurrentStats: submitCurrentStats};	
};

module.exports = SocketController;

