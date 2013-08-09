var FileCache = (function() {  
  var _getCookie = function(c_name) {
    var i,x,y,ARRcookies=(document.cookie || "").split(";");
    for (i=0;i<ARRcookies.length;i++) {
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x==c_name) return unescape(y);
    }
  }

  var _setCookie = function(c_name,value,exdays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
  }
    
  var get = function(name) {
    return _getCookie(name);
  }

  var set = function(name, data) {
    _setCookie(name, data, 365);
    return data;
  };

  var destroy = function(name) {
    _setCookie(name, "", 365);
  }

  return {get : get, set: set, destroy : destroy}
})();
