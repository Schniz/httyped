import * as t from "io-ts";
import fetch from "node-fetch";
import path from "path";
import express, { Express } from "express";
import { TypedExpress } from "./TypedExpress";
import { success } from "./Response";
import { RouteDefiner } from "../RouteDefiner";
import { Server } from "http";
import { AddressInfo } from "net";
import { getTypes } from "./__fixtures__/get-types";

let server: Server | null = null;

afterEach(() => {
  if (server) {
    server.close();
    server = null;
  }
});

test("Simple application works", async () => {
  const application = express();
  const app = new TypedExpress(application);

  app.route(RouteDefiner.get.returns(t.string).fixed("hello"), async () =>
    success("Hello world!")
  );

  const host = getHost(application);

  const result = await fetch(`${host}/hello`).then(x => x.json());

  expect(result.data).toEqual("Hello world!");
});

test("Parameters work", async () => {
  const application = express();
  const app = new TypedExpress(application);

  const Game = t.type({ name1: t.string, name2: t.string });
  app.route(
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

test("Types are inferred correctly", async () => {
  const types = getTypes(
    path.resolve(__dirname, "./__fixtures__/express-server.ts")
  );
  expect(types).toMatchSnapshot();
});

function getHost(app: Express) {
  server = app.listen(0);
  const port = (server.address() as AddressInfo).port;
  return `http://localhost:${port}`;
}
