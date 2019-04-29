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
      'FILTER(STR(?other) < "dfg"). ' +
      '?mickey foaf:knows/foaf:knows ?donald. ' +
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

var spinPlus2spaAsUpdate = fs.readFileSync('./update/spinPlus2spa1.ru', 'utf8');
var parsedUpdate = parser.parse(spinPlus2spaAsUpdate)
var updateAsSpinPlus = sparqljs2spinPlus(parsedUpdate);
console.log(prettyjson.render(updateAsSpinPlus));


// console.log(spinPlus2spaAsUpdate);

// spinPlus2spaAsUpdate = 'INSERT {<http://example.org/s> <http://example.org/p> <http://example.org/o>.} WHERE {?s ?p ?o};';
// spinPlus2spaAsUpdate = 'INSERT DATA {<http://example.org/s> <http://example.org/p> <http://example.org/o>.};';

async.autoInject({
  store: [rdfstore.create],
  load: function(store, cb) {
    store.load('application/ld+json', queryAsSpinPlus, cb);
  },
  // parseUpdate: function(store, cb) {
  //   // var syntaxTree = store.engine.abstractQueryTree.parseQueryString(spinPlus2spaAsUpdate);
  //   // console.log(syntaxTree);
  //   cb(null);
  // },
    // console.log(prettyjson.render(results));
  update: function(store, load, cb) {
    console.log(load);
    store.execute(spinPlus2spaAsUpdate, cb);
  },
  quads: function(store, update, cb) {
    rdfstore2quads(store, cb);
    // cb(store);
  }}, function(err, result) {
    if (err) { console.error(prettyjson.render(err)); }
    else { console.log(result.quads);  }
  });
