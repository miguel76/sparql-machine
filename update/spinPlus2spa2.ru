PREFIX sp: <http://spinrdf.org/sp#>
PREFIX spa: <http://meta-sparql.org/vocab/spa#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

INSERT {
  ?union
    a spa:Union ;
    spa:subOp ?memberOfUnion .
} WHERE {
  ?union
    a sp:Union ;
    sp:elements ?list .
    {
      ?list rdf:rest+ ?memberOfList .
      ?memberOfList rdf:first ?memberOfUnion .
    } UNION {
      ?list rdf:first ?memberOfUnion .
    }
};

# TODO: GraphGraphPattern

# - GroupGraphPattern
INSERT {
#  []
  ?list
    a spa:EmptyBGP ;
    spa:next ?list .
} WHERE {
  ?element sp:elements ?list .
  FILTER NOT EXISTS { ?element a sp:Union }
}
