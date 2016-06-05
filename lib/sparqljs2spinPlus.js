var N3 = require('n3'),
    _ = require('lodash'),
    fs = require('fs');

var spinContext = JSON.parse(fs.readFileSync('./context/spinPlus.jsonld', 'utf8'));

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

module.exports = function(queryAsSparqljs) {
  var queryAsSpinPlus = convertN3(queryAsSparqljs);
  queryAsSpinPlus['@context'] = spinContext;
  return queryAsSpinPlus;
};
