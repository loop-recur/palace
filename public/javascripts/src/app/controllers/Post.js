var Palace = require('Palace');

var Post = function(view, args){
  Palace.expose();

    //+ fillPage :: Post -> Html
    var fillPage = function(post){
          var v = html('#title', view, post.title);
          return html('#content', v, post.body);
        }

    //+ updatePost :: Post -> Message({html: Html, selector: String})
      , updatePost = compose(updateHtml('#main'), fillPage)
      ;

  fmap(updatePost, on('postChanged', 'PostList'));
};
