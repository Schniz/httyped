import * as E from "express";
import * as t from "io-ts";
import { RouteDefiner, Method } from "../RouteDefiner";
import { make as makeRequest } from "./Request";
import { RouteCallback, ServerRoute } from "./Route";

export class TypedExpress {
  private readonly app: E.Router;
  private routes: ServerRoute<any, any, any, any>[] = [];

  static of(app: E.Router) {
    return new TypedExpress(app);
  }

  constructor(app: E.Router) {
    this.app = app;
  }

  route<
    Params extends string,
    RouteResult extends t.Any,
    RequestType extends t.Any
  >(
    routeDefiner: RouteDefiner<RequestType, RouteResult, Params, Method>,
    callback: RouteCallback<
      t.TypeOf<RequestType>,
      t.TypeOf<RouteResult>,
      Params
    >
  ) {
    const route = new ServerRoute({
      callback,
      routeDefiner
    });
    this.routes.push(route);

    const routeString = route.routeDefiner.toRoutingString();
    this.app[route.routeDefiner.method as "get" | "post"](
      routeString,
      route.getMiddlewares(),
      async (req: E.Request, res: E.Response, next: E.NextFunction) => {
        try {
          const typedRequest = makeRequest(req, route.routeDefiner);
          const { status, body, headers } = await route.callback(typedRequest);
          for (const [key, value] of Object.entries(headers || {})) {
            res.header(key, value);
          }
          res.status(status).json(body);
        } catch (e) {
          next(e);
        }
      }
    );
  }

  listRoutes() {
    const tableData = this.routes.map(route => {
      return route.routeDefiner.toJSON();
    });

    console.log("Routes:");
    console.table(tableData);
  }
}
