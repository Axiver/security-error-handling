import { ZodParsedType } from "zod";
import { ApiError } from "./BaseError";

export class QueryError extends ApiError {
  constructor() {
    super();
    this.message = "Invalid query";
    this.status = 2000;
  }
}

/**
 * Cannot find [...]
 */
export class NotFoundError extends QueryError {
  constructor(item: string) {
    super();
    this.message = `Cannot find ${item}`;
    this.status = 2001;
  }
}

/**
 * Invalid query/body parameter
 * @param parameter The parameter name
 */
export class ParamError extends QueryError {
  public static readonly status = 422;
  public static readonly code: number = 2002;

  constructor(parameter?: string) {
    super();
    this.message = `Invalid ${parameter || "parameter"} supplied`;
    this.status = ParamError.status;
    this.code = ParamError.code;
  }
}

/**
 * Missing query/body parameter
 * @param parameter The parameter name
 */
export class ParamRequiredError extends ParamError {
  public static readonly status = 422;
  public static readonly code = 2003;

  constructor(parameter: string) {
    super();
    this.message = `Parameter '${parameter}' is required'`;
    this.status = ParamTypeError.status;
    this.code = ParamTypeError.code;
  }
}

/**
 * Invalid query/body parameter type
 * @param parameter The parameter name
 * @param expectedType The expected type of the parameter
 * @param actualType The actual type of the parameter
 */
export class ParamTypeError extends ParamError {
  public static readonly status = 422;
  public static readonly code = 2004;

  constructor(parameter: string, expectedType: ZodParsedType, actualType: ZodParsedType) {
    super();
    this.message = `Expected '${parameter}' to be of type '${expectedType}, but got type '${actualType}'`;
    this.status = ParamTypeError.status;
    this.code = ParamTypeError.code;
  }
}
