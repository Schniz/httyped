import * as t from "io-ts";
import fetch from "node-fetch";
import express, { Express } from "express";
import { TypedExpress } from "./TypedExpress";
import { success } from "./Response";
import { RouteDefiner } from "../RouteDefiner";
import { Server } from "http";
import { AddressInfo } from "net";

let server: Server | null = null;

afterEach(() => {
  if (server) {
    server.close();
    server = null;
  }
});

test.only("Simple application works", async () => {
  const application = express();
  const app = new TypedExpress(application);

  app.and(RouteDefiner.get.returns(t.string).fixed("hello"), async () =>
    success("Hello world!")
  );

  const host = getHost(application);

  const result = await fetch(`${host}/hello`).then(x => x.json());

  expect(result).toEqual({ success: true, data: "Hello world!" });
});

test("Parameters work", async () => {
  const application = express();
  const app = new TypedExpress(application);

  const Game = t.type({ name1: t.string, name2: t.string });
  app.and(
    RouteDefiner.get
      .returns(Game)
      .param("name1")
      .fixed("vs")
      .param("name2"),
    async req => success({ name1: req.params.name1, name2: req.params.name2 })
  );

  const host = getHost(application);

  const result = await fetch(`${host}/gal/vs/the world`).then(x => x.json());

  expect(Game.decode(result.data).isRight()).toBe(true);
  expect(result.data).toEqual({ name1: "gal", name2: "the world" });
});

function getHost(app: Express) {
  server = app.listen(0);
  const port = (server.address() as AddressInfo).port;
  return `http://localhost:${port}`;
}
