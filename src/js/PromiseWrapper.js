/*global module, Promise*/
class PromiseWrapper {
  constructor () {
    let resolver;
    let rejecter;
    let promise = new Promise(function (resolve, reject) {
      resolver = resolve;
      rejecter = reject;
    });
    promise.resolver = resolver;
    promise.rejecter = rejecter;
    return promise;
  }
}
module.exports = PromiseWrapper;
