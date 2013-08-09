SiteController = require('./site_controller');

module.exports = function(app){
	// Routes
	app.get('/', SiteController.index);
};

