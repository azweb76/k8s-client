var qs = require('querystring');

var toSelector = function toSelector(selector){
  var p = [];
  for(var x in selector){
    var v = selector[x];
    if (typeof selector[x] === 'object'){
      if (v === null){
        p.push(x + '=null')
      } else {
        p.push(x + v.op + (v.value === null ? 'null' : v.value.toString()))
      }
    }
    else {
      p.push(x + '=' + v.toString());
    }
  }
  return p.join(',');
};

module.exports = {
  toSelector: toSelector
}
