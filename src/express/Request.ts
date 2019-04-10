import { RequestParamFetcher } from "./RequestParamFetcher";
import { RouteDefiner, RouteParams, Method } from "../RouteDefiner";
import * as t from "io-ts";
import * as E from "express";

export type Request<P extends string, RequestType> = {
  params: RouteParams<P>;
  body: RequestType;
};

export function make<
  I extends t.Any,
  O extends t.Any,
  P extends string,
  M extends Method
>(req: E.Request, rd: RouteDefiner<I, O, P, M>): Request<P, I> {
  return {
    params: new RequestParamFetcher(rd, req).getAll(),
    body: methodsWithoutBodies.has(rd.method) ? null : (req.body as t.TypeOf<I>)
  };
}

const methodsWithoutBodies: Set<Method> = new Set(["get"]);
