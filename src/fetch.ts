import * as t from "io-ts";
import { RouteDefiner, Meta } from "./RouteDefiner";
import nodeFetch, { Headers } from "node-fetch";
import { Response } from "./express/Response";

type TypedResponse<T> = {
  status: number;
  headers: Headers;
  data: T;
};

type Opts<M, Params, Body> = ([keyof Params] extends [never]
  ? { params?: Params }
  : {
      params: Params;
    }) &
  (M extends "get"
    ? {}
    : {
        body: [Body] extends [never] ? undefined : Body;
      });

export async function fetch<
  I extends t.Any,
  O extends t.Any,
  P extends string,
  M extends string
>(
  rd: RouteDefiner<I, O, P, M>,
  opts: Opts<M, Meta.Params<typeof rd>, Meta.RequestBodyType<typeof rd>>,
  rootURL: string
): Promise<TypedResponse<Meta.ResponseType<typeof rd>>> {
  const path = rd.toString(opts.params || ({} as Meta.Params<typeof rd>));
  const response = await nodeFetch(`${rootURL}${path}`, {
    method: rd.method,
    ...(rd.method !== "get" && {
      headers: {
        "Content-Type":
          rd.requestType.name === "string" ? "text/plain" : "application/json"
      },
      body:
        rd.requestType.name === "string" ? opts.body : JSON.stringify(opts.body)
    })
  });

  const data = await response.json();
  return { status: response.status, data, headers: response.headers };
}

export function fetcher<
  I extends t.Any,
  O extends t.Any,
  P extends string,
  M extends string
>(rd: RouteDefiner<I, O, P, M>, rootURL: string = "/") {
  return (
    opts: Opts<M, Meta.Params<typeof rd>, Meta.RequestBodyType<typeof rd>>
  ) => fetch(rd, opts, rootURL);
}
