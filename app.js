
/**
 * Module dependencies.
 */
POSTS = [{id:1, title: "one", body: "I am post one"}, {id: 2, title: 'two', body: "I am post two"}]

COMMENTS = { "1": [{body: "This post is sexy!"}, {body: "I am spam"}]
					 , "2": [{body: "I don't understand..."}, {body: "You should really stop blogging"}]
					 }

LIKES = { "1": [{user: "Joe"}]
				, "2": [{user: "Bob"}, {user: "Anne"}]
				}

var express = require('express')
	, app = express.createServer()
 	, io = require('socket.io').listen(app, {origins: '*:*'});	

 	app.use(express.bodyParser());

// io.configure(function () { 
//   io.set("transports", ["xhr-polling"]); 
//   io.set("polling duration", 10); 
// });

// require('./http_controllers')(app);
// require('./models');

app.get('/', function(req, res) {
	res.render('index', {title: 'Testers'})
});

app.get('/test', function(req, res) {
	res.render('test', {title: 'SocketTest'})
});

app.get('/posts', function(req, res) {
	res.send(JSON.stringify(POSTS));
});

app.post('/posts', function(req, res) {
	console.log(req.body, req.params);
	POSTS.push(req.body)
	res.send(JSON.stringify(POSTS));
});

app.get('/comments', function(req, res) {
	res.send(JSON.stringify(COMMENTS[req.query.id]));
});

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set("json callback", true);
	app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.cookieParser());
  app.use(express.logger({ format: ':method :url' }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

io.sockets.on('connection', function (socket) {
	socket.on('/likes', function(e) {
		socket.emit("/likes", LIKES[String(e.id)]);
	});

	socket.on('/comments', function(e) {
		console.log("--------COMMMENTS----------")
		socket.emit("/comments", COMMENTS[String(e.id)]);
	});

	socket.on("/comments#add", function(e) {
		var id = String(e.id);
		COMMENTS[id].push(e.comment);
		socket.broadcast.emit("/comments", COMMENTS[id]);
	})
});

if (!module.parent) {	
	var port = process.env.PORT || 4000;
  app.listen(port);
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}
