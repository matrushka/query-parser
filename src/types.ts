import type ohm from "ohm-js";

export type StringQueryNode = {
  type: "string";
  value: string;
};

export type KeywordQueryNode = {
  type: "keyword";
  key: string;
  value: string;
};

export type LogicQueryNodeType = "and" | "or";
export type LogicQueryNode = {
  type: "logic";
  value: LogicQueryNodeType;
  children: QueryNode[];
};

export type QueryNode = StringQueryNode | KeywordQueryNode | LogicQueryNode;

export type QuerySemantics<T> = {
  Exp: (e: ohm.Node) => T;
  KeywordExp_quoted: (
    left: ohm.Node,
    _open: ohm.Node,
    right: ohm.Node,
    _close: ohm.Node
  ) => T;
  KeywordExp_simple: (left: ohm.Node, _open: ohm.Node, right: ohm.Node) => T;
  LogicalExp_and: (left: ohm.Node, _op: ohm.Node, right: ohm.Node) => T;
  LogicalExp_or: (left: ohm.Node, _op: ohm.Node, right: ohm.Node) => T;
  LogicalExp_join: (left: ohm.Node, right: ohm.Node) => T;
  LogicalExp?: (exp: ohm.Node) => T;
  PriExp: (exp: ohm.Node) => T;
  PriExp_keyword: (exp: ohm.Node) => T;
  PriExp_paren: (_open: ohm.Node, exp: ohm.Node, _close: ohm.Node) => T;
  PriExp_quote: (_open: ohm.Node, exp: ohm.Node, _close: ohm.Node) => T;
  spacedString_spaced: (left: ohm.Node, _space: ohm.Node, right: ohm.Node) => T;
  ident: (char: ohm.Node, item: ohm.Node) => T;
};
