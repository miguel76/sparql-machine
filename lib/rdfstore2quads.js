var async = require('async'),
    _ = require('lodash');

var graphNameAdder = function(graphName) {
  return graphName ?
    _.flow([
      _.bind(String.prototype.split, _, /\s*\.\r?\n/),
      _.partialRight(_.map, _.bind(String.prototype.concat, _, ' ', graphName, '.')),
      _.partialRight(_.join, '\n')]) : _.identity;
};

var graphQuadsExtractor = function(store) {
  return function(graphName, callback) {
    if (arguments.length === 1) {
      callback = graphName;
      graphName = undefined;
    }
    store.graph(function(err, result) {
      if (err) { callback(err); }
      else {
        callback(null, graphNameAdder(graphName)(result.toNT()));
      }
    });
  };
};

module.exports = function(store, callback) {
  async.autoInject({
    defaultGraphQuads: [graphQuadsExtractor(store)],
    graphNames: function(cb) {store.registeredGraphs(cb);},
    namedGraphQuads: function(graphNames, cb) {async.map(graphNames, graphQuadsExtractor, cb);}
  }, function(err, result) {
    if (err) { callback(err); }
    else {
      var quads = result.namedGraphQuads;
      quads.push(result.defaultGraphQuads);
      callback(null, _.join(quads, '\n'));
    }
  });
};
