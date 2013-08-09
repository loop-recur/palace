var Palace = require('Palace');

var Likes = function(view, args){
  Palace.expose();

  //+ populateTable :: [Like] -> Table
  var populateTable = compose(append('table', view), map(render_('LikeRow')))

	//+ getLikes :: Id -> EventStream([Like])
    , getLikes = compose(emit('/likes', 'socket'), setVals({id: id}))

  //+ makeLikes :: Post -> AddView(Table)
    , makeLikes = compose(updateHtml('#likes'), populateTable)

  //+ init :: Post -> Promise(AddView(Table))
    , init = compose(getLikes, pluck('id'))
    ;

  fmap(init, on('postChanged', 'PostList'));
  fmap(makeLikes, on('/likes', 'socket'))
};
