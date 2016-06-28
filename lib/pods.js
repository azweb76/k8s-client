module.exports = function(base, client){
  base.createAndWait = function createAndWait(pod, options, callback){
    if(typeof options === 'function') callback = options;
    base.create(pod, function(err, newPod){
      if (err) return callback(err);
      base.waitForReady(newPod, options, callback);
    });
  }

  base.waitForReady = function waitForReady(pod, options, callback){
    var readyFilter = function readyFilter(o){
      return o.type === 'Ready';
    };
    var timeout = options.timeoutMs || 30000;
    var startDate = Date.now();
    var checkPod = function(){
      base.get(pod.metadata.name, function(err, pod){
        if(err) return callback(err);

        var isReady = true;
        if (pod.status.conditions){
          var readyCondition = pod.status.conditions.find(readyFilter);
          if(readyCondition.status !== 'True') isReady = false;
        }
        else {
          isReady = false;
        }

        if (isReady){
          return callback(null, pod);
        }
        else {
          if ((Date.now() - startDate) > timeout){
            callback(new Error('timeout expired while waiting for pod ready state.'))
          }
          else {
            setTimeout(checkPod, options.checkIntervalMs || 1000);
          }
        }
      });
    }
    checkPod();
  };

  return base;
}
