import { Data } from "effect";

export class InvalidValue extends Data.TaggedError("InvalidValue")<{
  readonly message: string;
}> {}
export class PermissionDenied extends Data.TaggedError("PermissionDenied")<{
  readonly message: string;
}> {}

export class ParsingError extends Data.TaggedError("ParsingError")<{
  readonly message: string;
}> {}

export class InternalError extends Data.TaggedError("InternalError")<{
  readonly message: string;
}> {}

export class NotFound extends Data.TaggedError("NotFound")<{
  readonly message: string;
}> {}
