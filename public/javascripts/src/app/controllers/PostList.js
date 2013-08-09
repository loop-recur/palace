var Palace = require('Palace');

var PostList = function(view, args){
  Palace.expose();

  //+ getPosts :: Params -> EventStream([Post])
  var getPosts = emit('getPosts', 'repo')

  //+ rowClicked :: EventData -> EventStream(Post)
    , rowClicked = compose( emit('find', 'repo')
                          , pluck('id')
                          , pluck('source')
                          )
  
  //+ populateTable :: [Post] -> Table
    , populateTable = compose(append('table',view), map(render_('PostRow')))

  //+ buildView :: [Post] -> Table
    , buildView = compose(updateHtml('#side_table'), populateTable)
    ;

  fmap(buildView, on('getPosts', 'repo'));
  fmap(rowClicked, on('click', '#table'));
  fmap(emit('postChanged', 'PostList'), on('find', 'repo'));

  getPosts({});
};
