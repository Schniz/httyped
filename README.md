# `httype`

Strongly-typed with awesome autocompletion http server and client wrappers.

Let your compiler tell you when you break a contract with your client.

## Route

A route is defined by `RouteDefiner`.

:white_check_mark: Supports dynamic parameters

:white_check_mark: Supports a typed request body with [io-ts](https://github.com/gcanti/io-ts)

:white_check_mark: Supports a typed response type with [io-ts](https://github.com/gcanti/io-ts)

#### Examples:

* A route that returns a `string` output, with a fixed path of `/hello`:
  ```ts
  RouteDefiner.returns(t.string).fixed("hello")
  ```

* A route that returns a `string` output, with a dynamic path of `/hello/:name`:
  ```ts
  RouteDefiner.returns(t.string)
    .fixed("hello")
    .param("name")
  ```

* A route that reads a custom type `User` from the request body and returns a custom type `Greeting`:
  ```ts
  const Greeting = t.type({ msg: t.string });
  const User = t.type({ name: t.string });

  RouteDefiner.reads(User).returns(Greeting)
    .fixed("user-to-greeting")
  ```

## Server

Implementation for servers is by wrapping Express.js

:white_check_mark: Type safe body parsing, thanks to [io-ts](https://github.com/gcanti/io-ts)

:white_check_mark: Awesome autocompletion for routing params and request body

:white_check_mark: Pretty routing table, documentation ready

```ts
import {TypedExpress, success} from 'httyped/express'
import express from 'express';

const app = TypedExpress.of(express());

app.get(RouteDefiner.returns(t.string).fixed("hello").param("name"), async req => {
  return success(`Hello, ${req.params.name}`);
})

app.listen(3000);
app.listRoutes(); // Will print a table of routes
```