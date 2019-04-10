import express from "express";
import { Server } from "http";
import { AddressInfo } from "net";
import * as t from "io-ts";

import { TypedExpress, success } from "./express";
import { RouteDefiner } from "./RouteDefiner";
import { fetcher } from "./fetch";

test("post data", async () => {
  const _app = express();
  const app = new TypedExpress(_app);
  const User = t.type({ name: t.string });

  const routes = {
    simple: RouteDefiner.get.returns(t.string).param("name"),
    user: RouteDefiner.post
      .reads(User)
      .returns(t.string)
      .param("name"),
    stringBody: RouteDefiner.post.reads(t.string).returns(t.string)
  };

  app.and(routes.user, async req => {
    return success(`from body: ${req.body.name}, param: ${req.params.name}`);
  });

  app.and(routes.stringBody, async req => {
    return success(`body: ${req.body}`);
  });

  app.and(routes.simple, async req => {
    return success(`body: ${req.body}, param: ${req.params.name}`);
  });

  const host = getHost(app);

  const fetchSimple = fetcher(routes.simple, host);
  const result = await fetchSimple({ params: { name: "gal" } });
  expect(result).toEqual({ success: true, data: `body: null, param: gal` });
});

let server: Server | null = null;

afterEach(() => {
  if (server) {
    server.close();
    server = null;
  }
});
function getHost(app: TypedExpress) {
  server = app.listen(0);
  const port = (server.address() as AddressInfo).port;
  return `http://localhost:${port}`;
}
