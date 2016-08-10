var errors  = require('./errors')
  , path = require('path')
  , request = require('request')
  , url = require('url')
  , util = require('util');

require('sugar');

module.exports = function (info) {
    var protocol = info.protocol || 'http'
      , host = info.host
      , version = info.version
      , token = info.token
      , timeout = info.timeout
      , namespace = info.namespace
      , clientCert = info.clientCert
      , clientKey = info.clientKey
      , caCert = info.caCert
      , infoUrl = info.url;

    var getUrl = function (object) {
        var prefix = 'api';

        // Allow options to override default  API prefix.
        if (object.options && object.options.apiPrefix) {
            prefix = object.options.apiPrefix;
        }

        if (infoUrl){
          var u = url.parse(infoUrl);
          host = u.hostname;
          protocol = u.scheme;
        }

        if (object.options && object.options.version) {
            version = object.options.version;
        }

        // Define base URL for the query.
        var query = protocol + '://' + path.join(host, prefix, version);

        // Fix query URL handling for proxy and watch endpoints.
        if (object.endpoint.match(/^proxy/)) {
            query = query + '/proxy';
            var endpoint = object.endpoint.replace('proxy/', '');
        } else if (object.endpoint.match(/^watch/)) {
            query = query + '/watch';
            var endpoint = object.endpoint.replace('watch/', '');
        } else {
            var endpoint = object.endpoint;
        }

        // v1beta3 and greater uses lowercase endpoints instead of
        //  camelCase and defines namespaces in the query URL.
        if ((version === 'v1beta3' || version === 'v1')) {
            //endpoint = endpoint.toLowerCase();
            // Never use URL namespacing for namespace or node endpoints.
            if (namespace && !endpoint.match(/^namespaces/) && !endpoint.match(/^nodes/)){
                return query + '/' + path.join('namespaces', namespace, endpoint);
            }
        }
        return query + '/' + endpoint;
    };

    var getAuthUrl = function (callback) {
        request({
            url: getUrl({endpoint: 'info'})
            , json: true
            , strictSSL: false
        }, function (err, resp, body) {
            if (err) {
                return callback(err);
            }

            if (resp.statusCode !== 200) {
                return callback(resp.statusCode, body);
            }

            callback(null, body.authorization_endpoint + '/oauth/token');
        });
    };
    var isSuccess = function (code) {
        return (code - (code % 200)) === 200;
    };

    var makeRequest = function (object, callback) {
        var object = Object.clone(object);
        object.url = getUrl(object);
        delete object.endpoint;
        if (!object.json) {
            object.json = true;
        }
        object.timeout = timeout;
        if (object.json) {
            if (['object', 'boolean'].none(typeof object.json)) {
                object.body = object.json;
                object.json = undefined;
            }
            else if (typeof object.json === 'object'){
              object.body = JSON.stringify(object.json);
              object.json = undefined;
            }
        }
        // Define paging options.
        if (object.page) {
            if (!object.qs) {
                object.qs = {};
            }
            object.qs.page = object.page;
            delete object.page;
        }
        object.strictSSL = caCert ? true : false;
        if (clientKey && clientCert) {
            object.cert = clientCert;
            object.key = clientKey;
            object.ca = caCert;
        }
        return request(object, function (err, resp, body) {
            if (err) {
              console.log('error', require('util').inspect(err))
                return callback(err);
            }

            if (isSuccess(resp.statusCode)) {
                if (typeof body === 'string'){
                  body = JSON.parse(body);
                }
                return callback(null, body);
            }

            return callback(errors.get(resp));
        });
    };

    return function (object, callback) {
        // Set request authorization token if it is defined.
        if (token) {
          //object.auth = {bearer: token};
          if (!object.headers) {
            object.headers = {};
          }
          object.headers['Authorization'] = 'bearer ' + token;
        }
        // Fix Content-Type header for PATCH methods.
        if (object.method === 'PATCH') {
            if (!object.headers) {
                object.headers = {};
            }
            object.headers['Content-Type'] = 'application/strategic-merge-patch+json';
        }
        // Use namespace querystring for older versions of kubernetes.
        if (namespace && version.match(/v1beta(1|2)/)) {
            if (!object.qs) {
                object.qs = {};
            }
            object.qs.namespace = namespace;
        }
        return makeRequest(object, callback);
    };
};
