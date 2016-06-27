PREFIX sp: <http://spinrdf.org/sp#>
PREFIX spa: <http://meta-sparql.org/vocab/spa#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

# Join
DELETE {
  ?topOp
    a spa:Filter ;
    spa:expr ?filterExpr ;
    spa:subOp ?join .
}
INSERT {
  ?topOp
    a spa:Join ;
    spa:subOp
      ?otherSubOp,
      [
        a spa:Filter ;
        spa:expr ?filterExpr ;
        spa:subOp ?subOpWithVars .
      ]
} WHERE {
  ?topOp
    a spa:Filter ;
    spa:expr ?filterExpr ;
    spa:subOp ?join .
  ?join
    a spa:Join ;
    spa:subOp ?subOpWithVars, ?otherSubOp .
  FILTER (?otherSubOp != ?subOpWithVars) .

  FILTER NOT EXISTS {
    ?join spa:subOp ?otherSubOp .
    ?otherSubOp spa:useVariable ?var .
    ?filterExpr spa:useVariable ?var .
    FILTER (?otherSubOp != ?subOpWithRelevantVars) .
  } .
};
