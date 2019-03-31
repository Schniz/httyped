import { RequestParamFetcher } from "./RequestParamFetcher";
import { RouteDefiner, RouteParams } from "../RouteDefiner";
import * as t from "io-ts";
import * as E from "express";

export type Request<P extends string, RequestType> = {
  params: RouteParams<P>;
  body: RequestType;
};

export function make<I extends t.Any, O extends t.Any, P extends string>(
  req: E.Request,
  rd: RouteDefiner<I, O, P>
): Request<P, I> {
  return {
    params: new RequestParamFetcher(rd, req).getAll(),
    body: req.body as t.TypeOf<I>
  };
}
