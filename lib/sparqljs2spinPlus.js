var N3 = require('n3'),
    _ = require('lodash'),
    fs = require('fs');

var spinContext = JSON.parse(fs.readFileSync('./context/spinPlus.jsonld', 'utf8'));

var isVar = function(term) {
  return term && term[0] === '?';
};

var convertN3Node = function(node) {
  return (
    isVar(node) ? {'@id': '_:vars_' + node.substr(1), 'type': 'variable', 'varName': node.substr(1)} :
    N3.Util.isIRI(node) || N3.Util.isBlank(node) ? {'@id': node} :
    N3.Util.getLiteralLanguage(node) ? {'@value': node, '@language': N3.Util.getLiteralLanguage(node)} :
    N3.Util.getLiteralType(node) ? {'@value': node, '@type': N3.Util.getLiteralType(node)} :
    node);
};

var convertN3Path = function(path) {
  return (
    !_.isObject(path) ? convertN3Node(path) :
    _.mapValues(path, function(value, key) {
      return key === 'items' ? _.map(value, convertN3Path) : value;
    }));
};

var convertN3Expr = function(expr) {
  return (
    !_.isObject(expr) ? convertN3Node(expr) :
    _.mapValues(expr, function(value, key) {
      return key === 'args' ? _.map(value, convertN3Expr) : value;
    }));
};

var convertN3 = function(parseTree) { return (
  _.isArray(parseTree) ? _.map(parseTree, convertN3) :
  !_.isObject(parseTree) ? parseTree :
  _.mapValues(parseTree, function(value, key) { return (
    _.indexOf(['subject', 'object'], key) !== -1 ? convertN3Node(value) :
    key === 'predicate' ? convertN3Path(value) :
    key === 'expression' ? convertN3Expr(value) :
    convertN3(value) );
  }));
};

module.exports = function(queryAsSparqljs) {
  var queryAsSpinPlus = convertN3(queryAsSparqljs);
  queryAsSpinPlus['@context'] = spinContext;
  return queryAsSpinPlus;
};
