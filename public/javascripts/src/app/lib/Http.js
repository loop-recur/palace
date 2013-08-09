var Http = (function() {
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

    , _startRequest = function(url, method, params) {
        var request = new XMLHttpRequest();
        var resultE = receiverE();

        if(method == "PUT" || method == "DELETE") {
          request.setRequestHeader("X-HTTP-Method-Override", method);
          method = "POST";
        }

        request.onreadystatechange = handler(request, resultE);
        request.open(method, url);
        params ? request.send(params) : request.send();
        return resultE;
      }

    , get = function(path, params){
        var url = _buildQueryString(path, params);
        return _startRequest(url, 'GET');
      }.autoCurry()

    , post = function(path, params){
        return _startRequest(path, 'POST', params);
      }.autoCurry()

    , put = function(path, params) {
        return _startRequest(path, 'PUT', params);
      }.autoCurry()

    , destroy = function(path, params) {
        return _startRequest(path, 'DELETE', params);
      }.autoCurry()

  return {get: get, put: put, post: post, destroy: destroy}
})();



var makeRequest = function(url, params) {
  var promise = new Promise();
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState==4) {
      var eitherResponse = Either.partial(Error(request));
      if(xhr.status == 200) {
        promise.resolve(eitherResponse(JSON.parse(request.responseText)));
      } else {
        promise.resolve(eitherResponse(null));
      }
    }
  }
  request.onerror = function() {
    promise.resolve(Either(Error(request), null));
  }
  request.open("GET", url);
  request.send();
  return promise;
}.autoCurry();

