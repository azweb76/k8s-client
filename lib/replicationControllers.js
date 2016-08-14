module.exports = function(base, client){
  base.scale = function(name, replicas, callback){
    base.patch(name, {
      spec: {
        replicas: replicas
      }
    }, callback);
  };

  base.createAndWait = function createAndWait(rc, options, callback){
    if (typeof options === 'function') callback = options;
    base.create(rc, function(err, newRc){
      if (err) return callback(err);
      base.waitForReplicas(newRc, options, callback);
    });
  }

  base.waitForReplicas = function waitForReplicas(rc, options, callback){
    var readyFilter = function readyFilter(o){
      return o.type === 'Ready';
    };
    if (typeof options === 'function'){
      callback = options;
    }
    var startDate = Date.now();
    var timeout = options.timeoutMs;

    var checkPods = function(){
      client.pods.getBySelector(rc.spec.selector, function(err, pods){
        if(err) return callback(err);

        var isReady = false;
        if(pods.items.length === rc.spec.replicas){
          isReady = true;
          pods.items.forEach(function(pod){
            if (pod.status.conditions){
              var readyCondition = pod.status.conditions.find(readyFilter);
              if(readyCondition && readyCondition.status !== 'True') isReady = false;
            }
            else {
              isReady = false;
            }
          });
        }
        if (isReady){
          return callback(null, rc);
        }
        else {
          if ((Date.now() - startDate) > timeout){
            callback(new Error('timeout expired while waiting for pod ready state.'))
          }
          else {
            setTimeout(checkPods, options.checkIntervalMs || 1000);
          }
        }
      });
    }
    checkPods();
  };

  base.scaleAndWait = function scaleAndWait(name, replicas, options, callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    }

    base.scale(name, replicas, function(err, rc){
      if (err) return callback(err);
      base.waitForReplicas(rc, options, callback);
    })
  };

  base.deleteOriginal = base.delete;
  base.delete = function(name, callback){
    base.scaleAndWait(name, 0, function(err, rc){
      if (err) return callback(err);
      base.deleteOriginal(name, callback);
    })
  };

  return base;
}
