# QueryParser

This package provides is a simple query language and a parser for it based on [ohm](https://github.com/harc/ohm).

## Features

- [Query Parsing & Matching](#query-parsing--matching)
- [Keywords](#keywords)
- [Logical Operators](#logical-operators)
- [Parenthesis](#parenthesis)
- [Quoted Strings](#quoted-strings)
- [Custom Semantics](#custom-semantics)

### Query Parsing & Matching

All queries can be parsed as JSON structure by using the exported `parse` function. Node definitions can be found in the [type definitions](src/types.ts).

It also exports a `custom` function which can be used for providing your own semantics for evaluating the query. It returns an object with the following definition:

- **semantics** ohm semantic object for the supplied semantic definitions.
- **eval(query: string)** returns the query evaluation based on the provided semantics.

### Keywords

You can use keywords to define special query behaviors such as filtering by a specific field. Keywords types can be any string without a space. Keyword values can be quoted if it includes a string (ex: `title:"hello world`).

#### Examples

`type:video` will be parsed as:

```json
{
  "type": "keyword",
  "key": "type",
  "value": "video"
}
```

### Logical Operators

You can use `OR` and `AND` keywords for simple logical operations. Spaces are also considered `AND` operations as long as they are not between strings.

#### Examples

`test OR hello OR world` will be parsed as:

```json
{
  "type": "logic",
  "value": "or",
  "children": [
    {
      "type": "string",
      "value": "test"
    },
    {
      "type": "string",
      "value": "hello"
    },
    {
      "type": "string",
      "value": "world"
    }
  ]
}
```

And `title:"test document" hello world` will be parsed as:

```json
{
  "type": "logic",
  "value": "and",
  "children": [
    {
      "type": "keyword",
      "key": "title",
      "value": "test document"
    },
    {
      "type": "string",
      "value": "hello world"
    }
  ]
}
```

### Parenthesis

You can use parenthesis just like in math to order your query.

#### Examples

`hello AND world OR test` will be parsed as

```json
{
  "type": "logic",
  "value": "and",
  "children": [
    {
      "type": "string",
      "value": "hello"
    },
    {
      "type": "logic",
      "value": "or",
      "children": [
        {
          "type": "string",
          "value": "world"
        },
        {
          "type": "string",
          "value": "test"
        }
      ]
    }
  ]
}
```

But the query can be rewritten as `(hello AND world) OR test` to change it to:

```json
{
  "type": "logic",
  "value": "or",
  "children": [
    {
      "type": "logic",
      "value": "and",
      "children": [
        {
          "type": "string",
          "value": "hello"
        },
        {
          "type": "string",
          "value": "world"
        }
      ]
    },
    {
      "type": "string",
      "value": "test"
    }
  ]
}
```

### Quoted Strings

You can also use quoted strings for forcing text queries.

#### Examples

`hello world OR test` will be parsed as `hello (world OR test)`.
But a quoted string can be used for fixing it as `"hello world" OR test` which will be parsed as:

```json
{
  "type": "logic",
  "value": "or",
  "children": [
    {
      "type": "string",
      "value": "hello world"
    },
    {
      "type": "string",
      "value": "test"
    }
  ]
}
```

### Custom Semantics

Exported `custom` function enables creation of custom semantics so you can change the way the query is parsed. You'll need to define your custom semantics to be able to achieve that. Please check the [custom semantics test](tests/custom.ts) for an example.
