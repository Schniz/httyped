import * as E from "express";
import * as t from "io-ts";
import { parseBody } from "./parseBody";
import { RouteDefiner } from "../RouteDefiner";
import { make as makeRequest, Request } from "./Request";
import { Response } from "./Response";
import { Server } from "http";

type Route<
  RequestType extends t.Any,
  ResponseType extends t.Any,
  P extends string
> = {
  method: "get" | "post";
  routeDefiner: RouteDefiner<RequestType, ResponseType, P>;
};

type RouteCallback<
  ParamNames extends string,
  ResponseResult,
  RequestType extends t.Any
> = (
  params: Request<ParamNames, t.TypeOf<RequestType>>
) => Promise<Response<ResponseResult>>;

export class TypedExpress {
  app: E.Express;
  routes: Route<any, any, any>[] = [];

  static of(app: E.Express) {
    return new TypedExpress(app);
  }

  constructor(app: E.Express) {
    this.app = app;
  }

  private route<
    Params extends string,
    RouteResult extends t.Any,
    RequestType extends t.Any
  >(
    method: "post" | "get",
    routeDefiner: RouteDefiner<RequestType, RouteResult, Params>,
    callback: RouteCallback<Params, t.TypeOf<RouteResult>, RequestType>
  ) {
    this.routes.push({ method, routeDefiner });
    const routeString = routeDefiner.toRoutingString();
    this.app[method](
      routeString,
      parseBody(routeDefiner.requestType),
      async (req: E.Request, res: E.Response, next: E.NextFunction) => {
        try {
          const typedRequest = makeRequest(req, routeDefiner);
          const result = await callback(typedRequest);
          res.send(result);
        } catch (e) {
          next(e);
        }
      }
    );
  }

  listen(...args: Parameters<E.Application["listen"]>) {
    return this.app.listen(...args);
  }

  get<
    Params extends string,
    RouteResult extends t.Any,
    RequestType extends t.Any
  >(
    routeDefiner: RouteDefiner<RequestType, RouteResult, Params>,
    callback: RouteCallback<Params, t.TypeOf<RouteResult>, RequestType>
  ) {
    this.route<Params, RouteResult, RequestType>("get", routeDefiner, callback);
  }

  post<
    Params extends string,
    RouteResult extends t.Any,
    RequestType extends t.Any
  >(
    routeDefiner: RouteDefiner<RequestType, RouteResult, Params>,
    callback: RouteCallback<Params, t.TypeOf<RouteResult>, RequestType>
  ) {
    this.route<Params, RouteResult, RequestType>(
      "post",
      routeDefiner,
      callback
    );
  }

  listRoutes() {
    const tableData = this.routes.map(route => {
      return {
        method: route.method,
        ...route.routeDefiner.toJSON()
      };
    });

    console.table(tableData);
  }
}
