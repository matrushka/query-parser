import ohm from "ohm-js";
import {
  LogicQueryNode,
  QueryNode,
  KeywordQueryNode,
  StringQueryNode,
  QuerySemantics,
} from "./types";

export const GRAMMAR_DEFINITION = `
Query {
  Exp
    = LogicalExp
    
  LogicalExp
    = PriExp "AND" LogicalExp -- and
    | PriExp "OR" LogicalExp -- or
    | PriExp LogicalExp -- join
    | PriExp

  PriExp
    = "(" Exp ")"  -- paren
    | "\\"" Exp "\\""  -- quote
    | KeywordExp -- keyword
    | ident

  KeywordExp
    = ident ":\\"" spacedString "\\"" --quoted
    | ident ":" ident --simple

  spacedString
    = spacedString spaces ident --spaced
    | ident
    
  ident (an identifier)
    = letter alnum*
}
`;

const flattenLogicalQueryNode = (node: LogicQueryNode): LogicQueryNode => {
  if (node.children.length !== 2) return node;
  const [left, right] = node.children;

  if (right.type !== node.type) return node;
  if (right.value !== node.value) return node;

  return {
    type: "logic",
    value: node.value,
    children: [left, ...right.children],
  };
};

const GRAMMAR = ohm.grammar(GRAMMAR_DEFINITION);
export const QUERY_SEMANTICS: QuerySemantics<QueryNode> = {
  Exp: (e): QueryNode => {
    return e.eval();
  },
  KeywordExp_quoted: (left, _open, right, _close): KeywordQueryNode => {
    const rightEval = right.eval();
    if (rightEval.type !== "string") throw new Error("Invalid keyword value");
    return {
      type: "keyword",
      key: left.source.contents,
      value: rightEval.value,
    };
  },
  KeywordExp_simple: (left, _open, right): KeywordQueryNode => {
    const rightEval = right.eval();
    if (rightEval.type !== "string") throw new Error("Invalid keyword value");
    return {
      type: "keyword",
      key: left.source.contents,
      value: rightEval.value,
    };
  },
  LogicalExp_and: (left, _op, right): LogicQueryNode => {
    return flattenLogicalQueryNode({
      type: "logic",
      value: "and",
      children: [left.eval(), right.eval()],
    });
  },
  LogicalExp_or: (left, _op, right): LogicQueryNode => {
    return flattenLogicalQueryNode({
      type: "logic",
      value: "or",
      children: [left.eval(), right.eval()],
    });
  },
  LogicalExp_join: (left, right): LogicQueryNode | StringQueryNode => {
    const leftEval: QueryNode = left.eval();
    const rightEval: QueryNode = right.eval();
    const canBeMerged =
      leftEval.type === "string" && rightEval.type === "string";

    if (canBeMerged) {
      const value = [leftEval.value, rightEval.value].join(" ");
      return { type: "string", value };
    }

    return flattenLogicalQueryNode({
      type: "logic",
      value: "and",
      children: [leftEval, rightEval],
    });
  },
  PriExp: (exp): QueryNode => {
    return exp.eval();
  },
  PriExp_keyword: (exp): QueryNode => {
    return exp.eval();
  },
  PriExp_paren: (_open, exp, _close): QueryNode => {
    return exp.eval();
  },
  PriExp_quote: (_open, exp, _close): StringQueryNode => {
    return exp.eval();
  },
  spacedString_spaced: (left, _space, right): StringQueryNode => {
    const value = [left.source.contents, right.source.contents].join(" ");
    return { type: "string", value: value };
  },
  ident: (char, item): StringQueryNode => {
    const value = [char.sourceString, item.sourceString].join("");
    return { type: "string", value };
  },
};
const grammarSemantics = GRAMMAR.createSemantics().addOperation(
  "eval",
  QUERY_SEMANTICS
);

const queryMatcher = (query: string, grammar: ohm.Grammar): ohm.MatchResult => {
  const queryMatch = grammar.match(query);
  if (queryMatch.failed()) {
    const error = new Error();
    error.name = ["Invalid Query", queryMatch.shortMessage]
      .filter((a) => !a)
      .join(": ");
    error.message = queryMatch.message || "";
    throw error;
  }
  return queryMatch;
};

const custom = <T>(
  semantics: QuerySemantics<T>
): {
  semantics: ohm.Semantics;
  eval: (query: string) => T;
} => {
  const customGrammar = ohm.grammar(GRAMMAR_DEFINITION);
  const customSemantics = customGrammar
    .createSemantics()
    .addOperation("eval", semantics);

  const customParser = (query: string) => queryMatcher(query, customGrammar);

  return {
    semantics: customSemantics,
    eval: (query: string) => customSemantics(customParser(query)).eval(),
  };
};

const parse = (query: string): QueryNode => {
  const queryMatch = queryMatcher(query, GRAMMAR);
  const evaluation: QueryNode = grammarSemantics(queryMatch).eval();
  return evaluation;
};

export { parse, custom };
