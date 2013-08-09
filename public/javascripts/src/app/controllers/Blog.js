var Palace = require('Palace')
	, Socket = require('Socket')
	, Repo = require('Repo')
	;

var Blog = function(){
	Palace.expose();	

	register('socket', Socket.create('http://localhost:4000'));
	register('repo', Repo());
	
	register('PostList', spawn('Palace', 'startController', ['PostList']));
	register('Post', spawn('Palace', 'startController', ['Post']));
	register('Comments', spawn('Palace', 'startController', ['Comments']));
	register('Likes', spawn('Palace', 'startController', ['Likes']));
};
