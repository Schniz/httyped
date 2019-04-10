import * as E from "express";
import * as t from "io-ts";
import { RouteDefiner } from "../RouteDefiner";
import { make as makeRequest } from "./Request";
import { RouteCallback, ServerRoute } from "./Route";

export class TypedExpress {
  app: E.Router;
  routes: ServerRoute<any, any, any, any>[] = [];

  static of(app: E.Router) {
    return new TypedExpress(app);
  }

  constructor(app: E.Router) {
    this.app = app;
  }

  private route<
    Params extends string,
    RouteResult extends t.Any,
    RequestType extends t.Any
  >(route: ServerRoute<RequestType, RouteResult, Params, any>) {
    this.routes.push(route);
    const routeString = route.routeDefiner.toRoutingString();
    this.app[route.routeDefiner.method as "get" | "post"](
      routeString,
      route.getMiddlewares(),
      async (req: E.Request, res: E.Response, next: E.NextFunction) => {
        try {
          const typedRequest = makeRequest(req, route.routeDefiner);
          const result = await route.callback(typedRequest);
          res.send(result);
        } catch (e) {
          next(e);
        }
      }
    );
  }

  and<Params extends string, RouteResult extends t.Any>(
    routeDefiner: RouteDefiner<t.Any, RouteResult, Params, any>,
    callback: RouteCallback<any, t.TypeOf<RouteResult>, Params>
  ) {
    const route = new ServerRoute({
      callback,
      routeDefiner
    });
    this.route<Params, RouteResult, t.Any>(route);
  }

  listRoutes() {
    const tableData = this.routes.map(route => {
      return route.routeDefiner.toJSON();
    });

    console.table(tableData);
  }
}
