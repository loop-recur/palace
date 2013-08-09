var quick_configs
	, socket = io.connect('http://localhost:4000');
	
$(function(){	

	var QuickConfigs
		, StatUpdateInterval = 6000
		, config_looper
		, car_stat_inputs
		, config_run_timer;

  var setDataFields = function() {
		socket.emit('car_stat_update', {event_name: 'current_data_stats', data: getCarStats()});
  };

	$('.add-on').click(function(){ $(this).siblings('input').trigger('change'); });


	var setQuickConfigs = function(data){
		console.log("setQuickConfigs", data);
		QuickConfigs = data;
		var quick_config_select = $('select#quick_config_select');
		$.each(QuickConfigs, function(k,v){
			quick_config_select.append('<option value="'+ k +'">' + k + '</option>');				
		});
	};

	car_stat_inputs = $('div.car_stats :input');
	
	var getCarStats = function(){
		var form_values = [];
		car_stat_inputs.each(function(){
			var form_elem = $(this);
			var data_pair = {
					input_name: form_elem.attr('name')
				,	input_value: form_elem.val()
			}
			form_values.push(data_pair); 
		});
		return form_values;
	};
	
	car_stat_inputs.change(function(){
		var elem = $(this);
 		var event_name = elem.attr('name')
			, car_stats = getCarStats();
		console.log("changed: event_name", event_name, "car_stats", car_stats);
		socket.emit('car_stat_update', {event_name: event_name, data: car_stats});
	});

	
	var ConfigLooper = function(config_data){
		var value_index = 0; 
		
		var _lastElementOfArray = function(arr){
			var index = Math.max(arr.length - 1, 0);
			return arr[index];
		};	
		
		var _isArray = function(obj){
			bool = Object.prototype.toString.call(obj) === '[object Array]' ? true : false
			return bool;
		};	
			
		// Returns true or false as to whether the data exists for increment value data with the index of value_index.	
		var _incrementalDataExists = function(){
			var existence = false;
			$.each(config_data, function(k, v){
				if(_isArray(v) && typeof(v[value_index]) != 'undefined'){
					existence = true;
					return false;
				}
			});
			return existence;
		};
		
		// Will turn multiple values in a config into a single set of key/value pairs.
		var _sanitizedData = function(){
			var data = {};
			if(!_incrementalDataExists()){ value_index = 0;}
			$.each(config_data, function(k,v){
				if(_isArray(v)){
					deduced_value = typeof(v[value_index]) == 'undefined' ? _lastElementOfArray(v) : v[value_index]
				} else {
					deduced_value = v
				}
				data[k] = deduced_value;
			});
			value_index++;
			return data;
		};	
		
		var _updateStats = function(){
			var data = _sanitizedData();
			console.log("sanitized_data = ", data);
			$.each(data, function(k,v){
				$('div.car_stats :input[name="' + k+ '"]').val(v);
			});
			var car_stats = getCarStats();
			// Put in something here to send all the data to the server. 
			socket.emit('car_stat_update', {event_name: "Running Config", data: car_stats});
		};
		
		var startLooping = function(){
			if(config_run_timer){stopLooping();}
			_updateStats();
			config_run_timer = setInterval(_updateStats, StatUpdateInterval);
		};
	
		var stopLooping = function(){
			console.log("clearing timer(?)", config_run_timer); 
			clearInterval(config_run_timer); 
		};
		
		return {startLooping: startLooping, stopLooping: stopLooping};
	};
	
	
	$('button#run_config').click(function(event){
		event.preventDefault();
		var config_key = $('select#quick_config_select').val();
		console.log("config_key", config_key);
		var config_values = QuickConfigs[config_key];
		console.log("sending config values to the looper", config_values);
		config_looper = ConfigLooper(config_values);
    var interval = Number($('input#set-interval-input').val());
    StatUpdateInterval = interval;
		var elem = $(this);
		var command_value = elem.val();
		console.log("command value", command_value, "for elem", elem);
		if(command_value == "1"){
			elem.val("0");
			elem.html("Stop Config");
			config_looper.startLooping();
		} else {
			socket.emit("stop_running_config");
			elem.val("1");
			elem.html("Run Config"); 
			config_looper.stopLooping();
		}
	});	


	socket.on("quick_configs", setQuickConfigs);
	socket.emit("request_configs");
  socket.on('getDataFields', setDataFields);
	
});

