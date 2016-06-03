// var sparqljs = require('sparqljs');
var prettyjson = require('prettyjson'),
    sparqljs2spinPlus = require('./lib/sparqljs2spinPlus'),
    rdfstore2quads = require('./lib/rdfstore2quads'),
    rdfstore = require('rdfstore'),
    fs = require('fs'),
    async = require('async');

// Parse a SPARQL query to a JSON object
var SparqlParser = require('sparqljs').Parser;
var parser = new SparqlParser();
var parsedQuery = parser.parse(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/> ' +
  'SELECT (count(?other) AS ?bingo) ?mickey { ' +
    '?mickey foaf:name "Mickey Mouse"@en; ' +
        'foaf:knows ?other. ' +
    '{ ' +
      '?mickey foaf:name "Mickey Mouse"@en; ' +
          'foaf:knows ?other. ' +
    '}. ' +
    '{ ' +
      '{ ' +
        '?mickey foaf:name "Mickey Mouse"@en; ' +
            'foaf:knows ?other. ' +
      '} UNION { ' +
        '?mickey foaf:name "Mickey Mouse"@en; ' +
            'foaf:knows ?other. ' +
      '}. ' +
    '}. ' +
  '}');

var queryAsSpinPlus = sparqljs2spinPlus(parsedQuery);

console.log(prettyjson.render(queryAsSpinPlus));

// jsonld.expand(parsedQuery, { expandContext: spinContext }, function(err, expanded) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(prettyjson.render(expanded));
//   }
// });

// jsonld.toRDF(parsedQuery, { expandContext: spinContext }, function(err, internal) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(prettyjson.render(internal));
//   }
// });

var spinPlus2spaAsUpdate = fs.readFileSync('./update/spinPlus2spa.ru', 'utf8');

async.autoInject({
  store: [rdfstore.create],
  load: function(store, callback) {
    store.load('application/ld+json', queryAsSpinPlus, callback);
  },
    // console.log(prettyjson.render(results));
  update: function(store, load, callback) {
    store.execute(spinPlus2spaAsUpdate, callback);
  },
  quads: function(store, update, callback) {
    rdfstore2quads(store, callback);
  }}, function(err, result) {
    if (err) { console.error(err); }
    else { console.log(result.quads); }
  });
