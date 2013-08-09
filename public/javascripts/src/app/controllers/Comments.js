var Palace = require('Palace');

Comments = function(view, args){
  Palace.expose();

  //+ populateTable :: [Comment] -> Table
  var populateTable = compose(append('table', view), map(render_('CommentRow')))

	//+ getComments :: Id -> EventStream([Comment])
    , getComments = compose(emit('/comments', 'socket'), setVals({id: id}))

  //+ makeComments :: Post -> AddView(Table)
    , makeComments = compose(updateHtml('#comments'), populateTable)

  //+ init :: Post -> Promise(AddView(Table))
    , init = compose(getComments, pluck('id'))
    ;

  fmap(init, on('postChanged', 'PostList'));
  fmap(makeComments, on('/comments', 'socket'));
};
