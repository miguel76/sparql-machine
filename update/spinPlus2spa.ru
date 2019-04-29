PREFIX sp: <http://spinrdf.org/sp#>
PREFIX spa: <http://meta-sparql.org/vocab/spa#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

# 18.2.2.6 Translate Graph Patterns
# - GroupOrUnionGraphPattern
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
};

INSERT {
  ?list
    a spa:Identity ;
    spa:subOp ?lastItemList .
} WHERE {
  ?element sp:elements ?list .
  ?list rdf:rest* ?lastItemList .
  ?lastItemList rdf:rest rdf:nil .
  FILTER NOT EXISTS { ?element a sp:Union }
};

#   - OPTIONAL
INSERT {
  ?listMember
    a spa:LeftJoin ;
    spa:leftOp ?currOp ;
    spa:rightOp ?optionalElements
} WHERE {
  ?currOp spa:next ?list .
  ?list rdf:first ?optional .
  ?optional
    a sp:Optional;
    sp:elements ?optionalElements .
}

# 18.2.2.7 Filters of Group
# INSERT {
#   ?union
#     a spa:Union;
#     spa:subOp ?memberOfUnion.
# } WHERE {
#   ?element
#     ;
#     sp:elements/rdf:rest*/rdf:first [a sp:Filter]
# };
