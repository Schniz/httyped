import express from "express";
import { Server } from "http";
import { AddressInfo } from "net";
import * as t from "io-ts";

import { TypedExpress, success } from "./express";
import { RouteDefiner } from "./RouteDefiner";
import { fetcher } from "./fetch";

type User = { name: string };
const User = t.type({ name: t.string });
const routes = {
  simple: RouteDefiner.get.param("name"),
  user: RouteDefiner.post
    .reads(User)
    .returns(t.string)
    .param("name"),
  stringBody: RouteDefiner.post.reads(t.string).returns(t.string)
};

describe("post data", () => {
  let host: string;
  let app: TypedExpress;

  beforeEach(() => {
    const _app = express();
    app = new TypedExpress(_app);
    host = getHost(_app);
  });

  test("Simple route", async () => {
    app.route(routes.simple, async req => {
      return success(`body: ${req.body}, param: ${req.params.name}`);
    });
    const fetch = fetcher(routes.simple, host);
    const result = await fetch({ params: { name: "gal" } });
    expect(result).toEqual(`body: null, param: gal`);
  });

  test("Parse JSON route", async () => {
    app.route(routes.user, async req => {
      return success(`from body: ${req.body.name}, param: ${req.params.name}`);
    });
    const fetch = fetcher(routes.user, host);
    const result = await fetch({
      params: { name: "gal" },
      body: { name: "gal" }
    });
    expect(result).toEqual(`from body: gal, param: gal`);
  });

  test("Parse string route", async () => {
    app.route(routes.stringBody, async req => {
      return success(`body: ${req.body}`);
    });
    const fetch = fetcher(routes.stringBody, host);
    const result = await fetch({
      params: { name: "gal" },
      body: "Hello world!"
    });
    expect(result).toEqual(`body: Hello world!`);
  });
});

let server: Server | null = null;

afterEach(() => {
  if (server) {
    server.close();
    server = null;
  }
});
function getHost(app: express.Express) {
  server = app.listen(0);
  const port = (server.address() as AddressInfo).port;
  return `http://localhost:${port}`;
}
