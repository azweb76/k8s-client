module.exports = function(base, client){
  base.scale = function(name, replicas, callback){
    base.patch(name, {
      spec: {
        replicas: replicas
      }
    }, callback);
  };

  base.waitForReplicas = function(rc, options, callback){
    var checkPods = function(){
      client.pods.getBySelector(rc.spec.selector, function(err, pods){
        if(err) return callback(err);

        var isReady = true;
        pods.items.forEach(function(pod){
          if (pod.status.conditions){
            var readyCondition = pod.status.conditions.find(readyFilter);
            if(readyCondition.status !== 'True') isReady = false;
          }
          else {
            isReady = false;
          }
        })
        if (isReady){
          return callback(null, rc);
        }
        else {
          setTimeout(checkPods, options.timeout || 1000)
        }
      });
    }
    checkPods();
  };

  base.scaleAndWait = function(name, replicas, options, callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    }

    var readyFilter = function readyFilter(o){
      return o.type === 'Ready';
    };
    base.scale(name, replicas, function(err, rc){
      if (err) return callback(err);
      base.waitForReplicas(rc, options, callback);
    })
  };

  base.deleteWithPods = function deleteWithPods(name, callback){
    base.scaleAndWait(name, 0, function(err, rc){
      if (err) return callback(err);
      base.delete(name, callback);
    })
  };

  return base;
}
