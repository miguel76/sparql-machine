var async = require('async'),
    _ = require('lodash');

var graphNameAdder = function(graphName) {
  return graphName ?
    _.flow([
      _.partialRight(_.split, /\s*\.\s*\r?\n/ ),
      _.partialRight(_.filter, function(nTriple) { return _.trim(nTriple) !== ''; }),
      _.partialRight(_.map, function(nTriple) { return nTriple + ' <' + graphName + '> .';}),
      _.partialRight(_.join, '\n')
    ]) : _.identity;
};

var graphQuadsExtractor = function(store) {
  return function(graphName, callback) {
    if (arguments.length === 1) {
      callback = graphName;
      graphName = undefined;
    }
    var cb = function(err, result) {
      if (err) { callback(err); }
      else {
        // console.log(graphName);
        // console.log(result.toNT());
        // console.log(graphNameAdder(graphName)(result.toNT()));
        callback(null, graphNameAdder(graphName)(result.toNT()));
      }
    };
    if (graphName) {
      store.graph(graphName, cb);
    } else {
      store.graph(cb);
    }

  };
};

module.exports = function(store, callback) {
  async.autoInject({
    defaultGraphQuads: [graphQuadsExtractor(store)],
    graphNodes: function(cb) {store.registeredGraphs(cb);},
    graphNames: function(graphNodes, cb) { cb(null, _.map(graphNodes, _.property('nominalValue')));},
    namedGraphQuads: function(graphNames, cb) {
      async.map(graphNames, graphQuadsExtractor(store), cb);
    }
  }, function(err, result) {
    if (err) { callback(err); }
    else {
      var quads = result.namedGraphQuads;
      quads.push(result.defaultGraphQuads);
      callback(null, _.join(quads, '\n'));
      // callback(null, quads);
    }
  });
};
