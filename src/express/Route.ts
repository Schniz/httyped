import * as t from "io-ts";
import { RouteDefiner } from "../RouteDefiner";
import { Response } from "./Response";
import { Request } from "./Request";
import bodyParser = require("body-parser");
import * as E from "express";
import { PathReporter } from "io-ts/lib/PathReporter";

export type RouteCallback<
  RequestBody,
  ResponseBody,
  ParamNames extends string
> = (
  params: Request<ParamNames, RequestBody>
) => Promise<Response<ResponseBody>>;

export class ServerRoute<
  RequestBody extends t.Any,
  ResponseBody extends t.Any,
  P extends string,
  M extends string
> {
  routeDefiner: RouteDefiner<RequestBody, ResponseBody, P, M>;
  callback: RouteCallback<RequestBody, ResponseBody, P>;

  constructor(opts: {
    routeDefiner: RouteDefiner<RequestBody, ResponseBody, P, M>;
    callback: RouteCallback<RequestBody, ResponseBody, P>;
  }) {
    this.routeDefiner = opts.routeDefiner;
    this.callback = opts.callback;
  }

  getMiddlewares() {
    const requestType = this.routeDefiner.requestType;
    if (!requestType) {
      return [];
    }
    const rt = requestType as t.Any;

    const parser = rt.name === "string" ? bodyParser.text() : bodyParser.json();

    return [parser, validate(rt)];
  }
}

const validate = (requestType: t.Any) => (
  req: E.Request,
  res: E.Response,
  next: E.NextFunction
) => {
  const body = req.body;
  const result = requestType.decode(body);
  const report = PathReporter.report(result);

  if (result.isRight()) {
    return next();
  } else {
    return res.status(406).json({
      success: false,
      errors: report
    });
  }
};
