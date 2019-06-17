export type Response<T> = {
  status: number;
  headers?: { [key: string]: string };
  body: T;
};

export function success<T>(data: T): Response<T> {
  return { status: 200, headers: {}, body: data };
}

export function response<T>(response: Response<T>): Response<T> {
  return response;
}
