import { custom } from "../src";

// Our custom semantics converts our query language to FQL
const wrapTextQuery = (value: string) => {
  if (value.startsWith("(") && value.endsWith(")")) return value;
  return `text ~= "${value}"`;
};

const customSemantics = custom({
  Exp: (e): string => {
    return e.eval();
  },
  KeywordExp_quoted: (left, _open, right, _close): string => {
    return `(${left.sourceString} = "${right.sourceString}")`;
  },
  KeywordExp_simple: (left, _open, right): string => {
    return `(${left.sourceString} = "${right.sourceString}")`;
  },
  LogicalExp_and: (left, _op, right): string => {
    return `(${wrapTextQuery(left.eval())}) AND (${wrapTextQuery(
      right.eval()
    )})`;
  },
  LogicalExp_or: (left, _op, right): string => {
    return `(${wrapTextQuery(left.eval())}) OR (${wrapTextQuery(
      right.eval()
    )})`;
  },
  LogicalExp_join: (left, right): string => {
    return `(${wrapTextQuery(left.eval())}) AND (${wrapTextQuery(
      right.eval()
    )})`;
  },
  PriExp: (exp): string => {
    return exp.eval();
  },
  PriExp_keyword: (exp): string => {
    return exp.eval();
  },
  PriExp_paren: (_open, exp, _close): string => {
    return exp.eval();
  },
  PriExp_quote: (_open, exp, _close): string => {
    return exp.eval();
  },
  spacedString_spaced: (left, _space, right): string => {
    return [left.source.contents, right.source.contents].join(" ");
  },
  ident: (char, item): string => {
    return [char.sourceString, item.sourceString].join("");
  },
});

describe("Custom Semantics", () => {
  const testQuery = (input: any, match?: any, debug = false) => {
    it(input, () => {
      const result = customSemantics.eval(input);
      if (debug) console.log(input, "\n", result);
      if (match) expect(result).toStrictEqual(match);
    });
  };

  testQuery("hello world", '(text ~= "hello") AND (text ~= "world")');

  testQuery(
    "type:video hello world",
    '((type = "video")) AND ((text ~= "hello") AND (text ~= "world"))'
  );

  testQuery('"hello world"', '(text ~= "hello") AND (text ~= "world")');

  testQuery(
    "type:video hello world",
    '((type = "video")) AND ((text ~= "hello") AND (text ~= "world"))'
  );

  testQuery(
    "test OR hello OR world",
    '(text ~= "test") OR ((text ~= "hello") OR (text ~= "world"))'
  );

  testQuery(
    'title:"test document" hello world',
    '((title = "test document")) AND ((text ~= "hello") AND (text ~= "world"))'
  );

  testQuery(
    '(title:"test document" hello world) OR test',
    '(((title = "test document")) AND ((text ~= "hello") AND (text ~= "world"))) OR (text ~= "test")'
  );

  testQuery(
    'title:"test document" OR hello world AND test',
    '((title = "test document")) OR ((text ~= "hello") AND ((text ~= "world") AND (text ~= "test")))'
  );
});
