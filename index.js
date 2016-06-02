// var sparqljs = require('sparqljs');
var prettyjson = require('prettyjson'),
    sparqljs2spinPlus = require('./lib/sparqljs2spinPlus'),
    rdfstore = require('rdfstore'),
    fs = require('fs');

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

var spinPlus2spaAsUpdate = JSON.parse(fs.readFileSync('./update/spinPlus2spa.ru', 'utf8'));

rdfstore.create(function(err, store) {
  store.load('application/ld+json', queryAsSpinPlus, function(err, results) {
    console.log(prettyjson.render(results));
    store.execute(spinPlus2spaAsUpdate, function(err) {
    });
  });
});
