const url = require('url');
const rc = require('./replicationControllers');
const pods = require('./pods');

require('sugar');

module.exports = function (info) {

    // ~~~~~ PRIVATE
    var self = this;

    if (info.url){
      var u = url.parse(info.url);
      info.host = u.hostname;
      info.protocol = u.protocol.substring(0, u.protocol.length - 1);
      info.port = u.port;
    }

    if (!info.port){
      info.port = (info.protocol == 'http' ? 80 : 443);
    }

    if (! info.host) {
        return new TypeError('host must be provided');
    }

    if (! info.version) {
        info.version = 'v1';
    }

    if (! info.namespace){
      info.namespace = 'default';
    }

    var request = require('./request')(info);

    // ~~~~~ PUBLIC

    var Collections = require('./collections');
    var collections = new Collections(request);

    // ~ minions
    this.minions = collections.create('minions');

    // ~ events
    this.events = collections.create('events');

    // ~ namespaces
    this.namespaces = collections.create('namespaces');

    // ~ pods
    this.pods = pods(collections.create('pods', null, [{ method: 'log', nested: false }], null));

    // ~ services
    this.services = collections.create('services');

    // ~ replicationControllers
    this.replicationControllers = rc(collections.create('replicationcontrollers'), this);

    // ~ nodes
    this.nodes = collections.create('nodes');

    // ~ endpoints
    this.endpoints = collections.create('endpoints');

    // ~ proxy minions
    this.proxyMinions = collections.create('proxy/minions');

    // ~ proxy nodes
    this.proxyNodes = collections.create('proxy/nodes');

    // ~ proxy pods
    this.proxyPods = collections.create('proxy/pods');

    // ~ proxy services
    this.proxyServices = collections.create('proxy/services');

    // ~ watch pods
    this.watchPods = collections.create('watch/pods');

    // ~ ingresses
    this.ingresses = collections.create('ingresses', null, null, {apiPrefix: '/apis/extensions', version: 'v1beta1'});

    // ~ deployments
    this.deployments = collections.create('deployments', null, null, {apiPrefix: '/apis/extensions', version: 'v1beta1'});

    // ~ jobs
    this.jobs = collections.create('jobs', null, null, {apiPrefix: '/apis/batch'});

    // Allow users to create custom collections also
    this.createCollection = collections.create;

    this.getVersion = function(cb) {
      request({
        endpoint: 'version',
        method: 'GET',
        options : {
          rawEndpoint: 'version'
        }
      }, function (err, result) {
        if (err) {
          cb(err, null)
        } else {
          cb(null, {
            major: parseInt(result.major),
            minor: parseInt(result.minor),
            gitVersion: result.gitVersion
          })
        }
      });
    };
};
