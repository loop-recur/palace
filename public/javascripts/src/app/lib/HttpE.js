var Http = function(){
  var self = {}
    , STREAMS = {}
    ;

  var handler = function(client, resultE){
        return function() {
          if (client.readyState==4) {
            resultE.sendEvent(JSON.parse(client.responseText));
          }
        }
      }

    , _buildQueryString = function(url, data) {
        var kv = [];
        for (var prop in data) {
          kv.push(encodeURIComponent(prop) + '=' + encodeURIComponent(data[prop]));
        }
        url = url + (url.indexOf('?') === -1 ? '?' : '&') + kv.join('&');
        return url;
      }

    , _startRequest = function(stream, url, method, params) {
        var request = new XMLHttpRequest();

        if(method == "PUT" || method == "DELETE") {
          request.setRequestHeader("X-HTTP-Method-Override", method);
          method = "POST";
        }

        request.onreadystatechange = handler(request, stream);
        request.open(method, url);
        params ? request.send(params) : request.send();
        return stream;
      }

    , get = function(stream, path, params){
        var url = _buildQueryString(path, params)
        return _startRequest(stream, url, 'GET')
      }.autoCurry()

    , post = function(stream, path, params){
        return _startRequest(stream, path, 'POST', params);
      }.autoCurry()

    , put = function(stream, path, params) {
        return _startRequest(stream, path, 'PUT', params);
      }.autoCurry()

    , destroy = function(stream, path, params) {
        return _startRequest(stream, path, 'DELETE', params);
      }.autoCurry()

    , _setupStream = function(name) {
        var resultE = receiverE();
        STREAMS[name] = (STREAMS[name] || resultE);
        return resultE;
      }

  	, onE = function(method_url_str) {
        return _setupStream(method_url_str);
      }.autoCurry()

  	, emitE = function(method_url_str, params) {
        var method_url = method_url_str.split(':');
        var stream = STREAMS[method_url_str] || setupStream(method_url_str);
        return self[method_url[0]](stream, method_url[1], params);
      }.autoCurry()
    ;


  self = {get: get, post: post, put: put, destroy: destroy}
  return {on: onE, emit: emitE};
}
