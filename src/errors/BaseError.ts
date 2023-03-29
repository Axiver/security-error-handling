export class BaseError extends Error {
  code: number;
  message: string;

  constructor() {
    super();
    this.message = "An error occured";
    this.code = 500;
  }

  toJSON() {
    return {
      status: this.code,
      message: this.message,
    };
  }
}

/**
 * Do not throw this error class directly.
 * Build on top of this error class instead.
 */
export class ApiError extends BaseError {
  code: number;

  constructor() {
    super();
    this.message = "Something went wrong";
    this.code = 500;
  }
}
