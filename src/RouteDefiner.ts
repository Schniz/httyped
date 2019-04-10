import * as t from "io-ts";
import { IfNever } from "./NullableIfNever";

export type RouteParams<ParamNames extends string> = {
  [param in ParamNames]: string
};

type RoutePieces<ParamNames> =
  | { type: "fixed"; text: string }
  | { type: "parameter"; name: ParamNames };

export type Method = "get" | "post";

export class RouteDefiner<
  RequestType extends t.Any,
  ResponseType extends t.Any,
  ParamNames extends string,
  Method extends string
> {
  private readonly pieces: RoutePieces<ParamNames>[] = [];
  readonly responseType: ResponseType;
  readonly requestType: RequestType;
  readonly method: Method;

  constructor(
    requestType: RequestType,
    responseType: ResponseType,
    pieces: RoutePieces<ParamNames>[],
    method: Method
  ) {
    this.requestType = requestType;
    this.responseType = responseType;
    this.pieces = pieces;
    this.method = method;
  }

  static get = new RouteDefiner<t.UnknownC, t.StringC, never, "get">(
    t.unknown,
    t.string,
    [],
    "get"
  );
  static post = new RouteDefiner<t.UnknownC, t.StringC, never, "post">(
    t.unknown,
    t.string,
    [],
    "post"
  );

  reads<NewRequestType extends t.Any>(requestType: NewRequestType) {
    return new RouteDefiner<NewRequestType, ResponseType, ParamNames, Method>(
      requestType,
      this.responseType,
      this.pieces,
      this.method
    );
  }

  returns<ResponseType extends t.Any>(responseType: ResponseType) {
    return new RouteDefiner<RequestType, ResponseType, ParamNames, Method>(
      this.requestType,
      responseType,
      this.pieces,
      this.method
    );
  }

  fixed(text: string) {
    return new RouteDefiner<RequestType, ResponseType, ParamNames, Method>(
      this.requestType,
      this.responseType,
      [...this.pieces, { type: "fixed", text }],
      this.method
    );
  }

  param<Param extends string>(name: Param) {
    return new RouteDefiner<
      RequestType,
      ResponseType,
      ParamNames | Param,
      Method
    >(
      this.requestType,
      this.responseType,
      [...this.pieces, { type: "parameter", name }],
      this.method
    );
  }

  toRoutingString(): string {
    const parts = this.pieces.map(piece => {
      switch (piece.type) {
        case "fixed":
          return piece.text;
        case "parameter":
          return `:${piece.name}`;
      }
    });

    return "/" + parts.join("/");
  }

  toString(params: RouteParams<ParamNames>) {
    const parts = this.pieces.map(piece => {
      switch (piece.type) {
        case "fixed":
          return piece.text;
        case "parameter":
          return params[piece.name];
      }
    });

    return "/" + parts.join("/");
  }

  toJSON() {
    return {
      path: this.toRoutingString(),
      takes: this.requestType ? this.requestType.name : null,
      returns: this.responseType.name
    };
  }
}

export namespace Meta {
  export type AnyRoute = RouteDefiner<any, any, any, any>;
  export type RequestBodyType<T extends AnyRoute> = T extends RouteDefiner<
    infer U,
    any,
    any,
    any
  >
    ? U extends t.Any
      ? t.TypeOf<U>
      : never
    : never;
  export type ResponseType<T extends AnyRoute> = T extends RouteDefiner<
    any,
    infer U,
    any,
    any
  >
    ? t.TypeOf<U>
    : never;
  export type Params<T extends AnyRoute> = T extends RouteDefiner<
    any,
    any,
    infer U,
    any
  >
    ? RouteParams<U>
    : never;
  export type Method<T extends AnyRoute> = T extends RouteDefiner<
    any,
    any,
    any,
    infer U
  >
    ? U
    : never;
}
