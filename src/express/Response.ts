export type Response<T> =
  | { success: true; data: T }
  | { success: false; error: any };

export function success<T>(x: T): Response<T> {
  return { success: true, data: x };
}
