import * as E from "express";
import * as t from "io-ts";
import * as bodyParser from "body-parser";
import { PathReporter } from "io-ts/lib/PathReporter";

export function parseBody<BodyType extends t.Any>(
  bodyType: BodyType
): ExpressMiddleware[] {
  const parser =
    bodyType.name === "string" ? bodyParser.text() : bodyParser.json();

  const validate = (req: E.Request, res: E.Response, next: E.NextFunction) => {
    const body = req.body;
    const result = bodyType.decode(body);
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

  return [parser, validate];
}

type ExpressMiddleware = (
  req: E.Request,
  res: E.Response,
  next: E.NextFunction
) => void;
