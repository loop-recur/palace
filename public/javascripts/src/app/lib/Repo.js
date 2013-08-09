var Http = require('Http');

var Repo = function() {
	var Cache = {}

	var getPosts = function(params) {
  			var stream = Http.get('/posts', params);
  			fmap(function(posts) { Cache['posts'] = posts; }, stream);
  			return stream;
  		}

  	, find = function(post_id) {
  			return detectBy(pluck('id'), post_id, Cache['posts']);
  		}

    , getComments = function() {
        emit('/comments', 'socket');
      }

    , createPost = function(attrs) {
      console.log('makin new posts', attrs)
      Http.post('/posts', attrs)
    } 
    ;

	return { getPosts: getPosts
         , getComments: getComments
         , createPost: createPost
         , find: find
         }
};