import express from "express";
import { TypedExpress } from "../TypedExpress";
import { type } from "os";
import { RouteDefiner } from "../../RouteDefiner";
import { success } from "../Response";
import * as t from "io-ts";

const app = express();
const typed = TypedExpress.of(app);

typed.route(
  RouteDefiner.post.reads(t.string).param("name"),
  /** @export RouteDefiner.post.reads(t.string).param("name") */ async req => {
    return success("Ok");
  }
);

typed.route(
  RouteDefiner.post
    .reads(t.string)
    .returns(t.type({ name: t.string }))
    .param("name"),
  /** @export RouteDefiner.post.reads(t.string).returns(t.type({ name: t.string })).param("name") */ async req => {
    return success({ name: req.params.name });
  }
);

typed.route(
  RouteDefiner.get.param("name"),
  /** @export RouteDefiner.get.param("name") */
  async req => {
    return success("Ok");
  }
);
