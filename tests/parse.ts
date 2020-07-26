import { parse } from "../src";

describe("Query Parser", () => {
  const testQuery = (input: any, match?: any, debug = false) => {
    it(input, () => {
      const result = parse(input);
      if (debug) console.log(input, "\n", JSON.stringify(result, null, "  "));
      if (match) expect(result).toStrictEqual(match);
    });
  };

  testQuery("hello world", {
    type: "string",
    value: "hello world",
  });

  testQuery("type:video hello world", {
    type: "logic",
    value: "and",
    children: [
      {
        type: "keyword",
        key: "type",
        value: "video",
      },
      {
        type: "string",
        value: "hello world",
      },
    ],
  });

  testQuery('"hello world"', {
    type: "string",
    value: "hello world",
  });

  testQuery("type:video hello world", {
    type: "logic",
    value: "and",
    children: [
      {
        type: "keyword",
        key: "type",
        value: "video",
      },
      {
        type: "string",
        value: "hello world",
      },
    ],
  });

  testQuery("test OR hello OR world", {
    type: "logic",
    value: "or",
    children: [
      {
        type: "string",
        value: "test",
      },
      {
        type: "string",
        value: "hello",
      },
      {
        type: "string",
        value: "world",
      },
    ],
  });

  testQuery('title:"test document" hello world', {
    type: "logic",
    value: "and",
    children: [
      {
        type: "keyword",
        key: "title",
        value: "test document",
      },
      {
        type: "string",
        value: "hello world",
      },
    ],
  });

  testQuery('(title:"test document" hello world) OR test', {
    type: "logic",
    value: "or",
    children: [
      {
        type: "logic",
        value: "and",
        children: [
          {
            type: "keyword",
            key: "title",
            value: "test document",
          },
          {
            type: "string",
            value: "hello world",
          },
        ],
      },
      {
        type: "string",
        value: "test",
      },
    ],
  });

  testQuery('title:"test document" OR hello world AND test', {
    type: "logic",
    value: "or",
    children: [
      {
        type: "keyword",
        key: "title",
        value: "test document",
      },
      {
        type: "logic",
        value: "and",
        children: [
          {
            type: "string",
            value: "hello",
          },
          {
            type: "string",
            value: "world",
          },
          {
            type: "string",
            value: "test",
          },
        ],
      },
    ],
  });
});
