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
    // async.autoInject({
    //   'graph': [graphName ? async.apply(store.graph, graphName) : store.graph],
    //   'triples': ['graph', async.asyncify(function(graph) { return graph.toNT(); })],
    //   'quads': ['triples', async.asyncify(graphNameAdder(graphName))]
    // }, function(err, result) {
    //   if (err) { callback(err); }
    //   else { callback(null, result.quads); }
    // });
    // async.waterfall([
      // graphName ? async.apply(store.graph, graphName) : store.graph,
      // async.asyncify(function(graph) { return graph.toNT(); }),
      // async.asyncify(graphNameAdder(graphName))
    // ], function(err, result) {
    //   if (err) { callback(err); }
    //   else { callback(null, result); }
    store.graph(function(err, result) {
      if (err) { callback(err); }
      else {
        callback(null, graphNameAdder(graphName)(result.toNT()));
      }
    });
  };
};

var guard = function(fun) {
  return function(callback) {
    // var cb = callback;
    var mycallback = function(err, result) {
      if (callback) {
        var cb = callback;
        callback = null;
        cb(err, result);
        // cb = null;
      } else if (err) {
        console.error(err);
      }
    };
    fun(mycallback);
  };
};

module.exports = function(store, callback) {
  async.autoInject({
    // 'start': [async.costant(true)],
    // 'defaultGraphQuads': [graphQuadsExtractor(store)],
    graphNames: [guard(store.registeredGraphs)],
    pippo: ['graphNames', async.asyncify( _.identity)]
    // 'graphQuadsExtractor': [async.costant(graphQuadsExtractor)]//,
    // 'namedGraphQuads': ['graphNames', 'graphQuadsExtractor', async.map]
  }, function(err, result) {
    if (err) { callback(err); }
    else {
      var quads = []; // result.namedGraphQuads;
      // quads.push(result.defaultGraphQuads);
      callback(null, _.join(quads, '\n'));
    }
  });
};
