// var sparqljs = require('sparqljs');
var jsonld = require('jsonld'),
    fs = require('fs'),
    prettyjson = require('prettyjson'),
    N3 = require('n3'),
    _ = require('lodash');

var spinContext = JSON.parse(fs.readFileSync('./context/spin.jsonld', 'utf8'));

var baseURI = "http://example.org/query/";

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

var varsBaseURI = baseURI + "vars/";

var isVar = function(term) {
  return term && term[0] === '?';
};

var convertN3 = function(parseTree) { return (
  _.isArray(parseTree) ? _.map(parseTree, convertN3) :
  !_.isObject(parseTree) ? parseTree :
  _.mapValues(parseTree, function(value, key) { return (
    _.indexOf(['subject', 'predicate', 'object'], key) === -1 ? convertN3(value) :
    isVar(value) ? {'@id': '_:vars_' + value.substr(1), 'type': 'variable', 'varName': value.substr(1)} :
    N3.Util.isIRI(value) || N3.Util.isBlank(value) ? {'@id': value} :
    N3.Util.getLiteralLanguage(value) ? {'@value': value, '@language': N3.Util.getLiteralLanguage(value)} :
    N3.Util.getLiteralType(value) ? {'@value': value, '@type': N3.Util.getLiteralType(value)} :
    value );
  }));
};

parsedQuery = convertN3(parsedQuery);

console.log(prettyjson.render(parsedQuery));

jsonld.expand(parsedQuery, { expandContext: spinContext }, function(err, expanded) {
  if (err) {
    console.log(err);
  } else {
    console.log(prettyjson.render(expanded));
  }
});

// jsonld.toRDF(parsedQuery, { expandContext: spinContext }, function(err, internal) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(prettyjson.render(internal));
//   }
// });
