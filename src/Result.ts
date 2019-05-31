import { left, right, Either } from "fp-ts/lib/Either";

export type Result<T> =
  | {
      success: false;
      errors: string[];
    }
  | { success: true; data: T };

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function errors<T = unknown>(errors: string[]): Result<T> {
  return { success: false, errors };
}

export function toEither<T>(result: Result<T>): Either<string[], T> {
  switch (result.success) {
    case true:
      return right(result.data);
    case false:
      return left(result.errors);
  }
}

export function fromEither<T>(either: Either<string[], T>): Result<T> {
  return either.fold(errs => errors(errs), data => ok(data));
}
