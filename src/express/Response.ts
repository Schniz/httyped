import { Result, ok } from '../Result';

export type Response<T> = {
  status: number;
  headers?: { [key: string]: string };
  body: Result<T>;
};

export function success<T>(data: T): Response<T> {
  return { status: 200, headers: {}, body: ok(data) };
}

export function response<T>(response: Response<T>): Response<T> {
  return response;
}
