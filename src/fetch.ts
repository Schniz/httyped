import * as t from "io-ts";
import { RouteDefiner, Meta } from "./RouteDefiner";
import nodeFetch from "node-fetch";
import { Response } from "./express/Response";

type Opts<Params, Body> = { params: Params; body: Body };

export async function fetch<I extends t.Any, O extends t.Any, P extends string>(
  rd: RouteDefiner<I, O, P>,
  opts: Opts<Meta.Params<typeof rd>, Meta.RequestBodyType<typeof rd>>,
  rootURL: string
): Promise<Response<Meta.ResponseType<typeof rd>>> {
  const path = rd.toString(opts.params);
  const response = await nodeFetch(`${rootURL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(opts.body)
  });

  return response.json();
}

export function fetcher<I extends t.Any, O extends t.Any, P extends string>(
  rd: RouteDefiner<I, O, P>,
  rootURL: string = "/"
): (
  opts: Opts<Meta.Params<typeof rd>, Meta.RequestBodyType<typeof rd>>
) => Promise<Response<Meta.ResponseType<typeof rd>>> {
  return opts => fetch(rd, opts, rootURL);
}
