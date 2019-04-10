import * as t from "io-ts";

export type RouteParams<ParamNames extends string> = {
  [param in ParamNames]: string
};

type RoutePieces<ParamNames> =
  | { type: "fixed"; text: string }
  | { type: "parameter"; name: ParamNames };

export class RouteDefiner<
  RequestType extends t.Any,
  ResponseType extends t.Any,
  ParamNames extends string
> {
  private readonly pieces: RoutePieces<ParamNames>[] = [];
  readonly responseType: ResponseType;
  readonly requestType: RequestType;

  constructor(
    requestType: RequestType,
    responseType: ResponseType,
    pieces: RoutePieces<ParamNames>[]
  ) {
    this.requestType = requestType;
    this.responseType = responseType;
    this.pieces = pieces;
  }

  static returns<ResponseType extends t.Any>(responseType: ResponseType) {
    return new RouteDefiner<t.Any, ResponseType, never>(
      t.any,
      responseType,
      []
    );
  }

  static reads<RequestType extends t.Any>(requestType: RequestType) {
    return new RouteDefiner<RequestType, t.StringType, never>(
      requestType,
      t.string,
      []
    );
  }

  returns<ResponseType extends t.Any>(responseType: ResponseType) {
    return new RouteDefiner<RequestType, ResponseType, ParamNames>(
      this.requestType,
      responseType,
      this.pieces
    );
  }

  fixed(text: string) {
    return new RouteDefiner<RequestType, ResponseType, ParamNames>(
      this.requestType,
      this.responseType,
      [...this.pieces, { type: "fixed", text }]
    );
  }

  param<Param extends string>(name: Param) {
    return new RouteDefiner<RequestType, ResponseType, ParamNames | Param>(
      this.requestType,
      this.responseType,
      [...this.pieces, { type: "parameter", name }]
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
      takes: this.requestType.name,
      returns: this.responseType.name
    };
  }
}

export namespace Meta {
  export type AnyRoute = RouteDefiner<any, any, any>;
  export type RequestBodyType<T extends AnyRoute> = T extends RouteDefiner<infer U, any, any> ? t.TypeOf<U> : never;
  export type ResponseType<T extends AnyRoute> = T extends RouteDefiner<any, infer U, any> ? t.TypeOf<U> : never;
  export type Params<T extends AnyRoute> = T extends RouteDefiner<any, any, infer U> ? RouteParams<U> : never;
}
