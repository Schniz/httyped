export type IfNever<T, Then, Else> = [T] extends [never] ? Then : Else;
export type BuildObjectIfNever<Name extends string, T> = [T] extends [never]
  ? {}
  : { [x in Name]: T };
