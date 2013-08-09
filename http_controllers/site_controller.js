/*
 * GET home page.
 */


exports.index = function(req, res){
	// Do some shit with your model. 
  res.render('index', {title: 'Test Admin'})
};

