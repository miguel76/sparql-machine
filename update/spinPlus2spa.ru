PREFIX sp: <http://spinrdf.org/sp>
PREFIX spa: <http://meta-sparql.org/vocab/spa#>

INSERT {
  GRAPH ?bgp {
    ?subject ?predicate ?object.
  }
} WHERE {
  ?bgp
    a spa:BGP;
    spa:tuple ?tuple.
  ?tuple
    sp:subject ?subject;
    sp:predicate ?predicate;
    sp:object ?object.
};
