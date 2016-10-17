/*global module*/
class Pubsub {
  constructor () {
    var ps = {};
    this.sub = function (ev, fn) {
      ps[ev] = ps[ev] || [];
      ps[ev].push(fn);
    };
    this.pub = function (ev, args) {
      var argsArr = Array.prototype.slice.apply(arguments);
      argsArr.splice(0, 1);
      ps[ev].forEach(function (fn) {
        fn.apply(null, argsArr);
      });
    };
  }
}
module.exports = Pubsub;
