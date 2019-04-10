import { RouteDefiner } from "../RouteDefiner";
import { Request } from "express";

export class RequestParamFetcher<ParamNames extends string> {
  routeDefiner: RouteDefiner<any, any, ParamNames, any>;
  request: Request;

  constructor(rd: RouteDefiner<any, any, ParamNames, any>, request: Request) {
    this.routeDefiner = rd;
    this.request = request;
  }

  get(name: ParamNames): string {
    return this.request.param(name);
  }

  getAll(): { [param in ParamNames]: string } {
    return this.request.params;
  }
}
