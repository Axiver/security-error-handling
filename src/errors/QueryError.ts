import { ApiError } from "./BaseError";

export class QueryError extends ApiError {
  constructor() {
    super();
    this.message = "Invalid query";
    this.code = 400;
  }
}

/**
 * Cannot find [...]
 */
export class NotFoundError extends QueryError {
  constructor(item: string) {
    super();
    this.message = `Cannot find ${item}`;
    this.code = 404;
  }
}
