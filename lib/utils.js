var qs = require('querystring');

module.exports = {
  toSelector: function(selector){
    var p = [];
    for(var x in selector){
      var v = selector[x];
      if (typeof selector[x] === 'object'){
        p.push(x + v.op + v.value.toString())
      }
      else {
        p.push(x + '=' + v.toString());
      }
    }
    return p.join(',');
  }
}
