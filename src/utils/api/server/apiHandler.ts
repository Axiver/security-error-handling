import { BaseError, ErrorJSON, ParamError, ParamRequiredError, ParamTypeError } from "@/errors";
import { NextApiRequest, NextApiResponse } from "next";
import { JWT } from "next-auth/jwt";
import nextConnect from "next-connect";
import { apiGuardMiddleware, APIGuardOptions } from "./middlewares/apiGuardMiddleware";
import { jwtMiddleware } from "./middlewares/jwtMiddleware";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

//-- Type definitions --//
// Define the type of the request object
export type APIRequestType = NextApiRequest & {
  token?: JWT | null;
};

// Define the type of the options object
type APIHandlerOptions = {} & APIGuardOptions;

/**
 * Zod error handler
 */
function handleZodError(error: ZodError) {
  // Prepare a resultant array
  const result = [];

  // Iterate through each Zod Issue
  for (const err of error.issues) {
    // Check if it was a type error
    if (err.code === "invalid_type") {
      // Yes it was
      // Check if it is due to a missing param
      if (err.received === "undefined") {
        // Yes it was, return a param error
        result.push(new ParamRequiredError(err.path[0].toString()).toJSON());
      }

      // Return a param type error
      result.push(new ParamTypeError(err.path[0].toString(), err.expected, err.received).toJSON());
    }

    // Unrecognised zod error
    result.push(new ParamError().toJSON());
  }

  return result;
}

/**
 * Prisma error handler
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
  // Check if it was a foreign key constraint error
  if (error.code === "P2003") {
    // Yes it was, return a param error
  }

  // Unrecognised prisma error
  return new ParamError();
}

/**
 * Error handler
 * @param $error The error
 * @returns An error object
 */
function handleError($error: Error): ErrorJSON[] {
  // An error occurred
  let error = $error;

  // Check if it was a zod error
  if (error instanceof ZodError) {
    // We got a zod error
    return handleZodError(error);
  }

  // Check if it was a prisma error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // We got a prisma error
    error = handlePrismaError(error);
  }

  // Check if it was a custom error
  if (error instanceof BaseError) {
    // Return the error message
    return [error.toJSON()];
  }

  // An unknown error was received
  console.error(error);
  return [new BaseError().toJSON()];
}

export default (options?: APIHandlerOptions) => {
  // Return the next-connect handler
  return nextConnect<APIRequestType, NextApiResponse>({
    //-- API error handling --//
    onError(error: Error | Error[], req, res) {
      // An error was thrown, initialise the response object
      const response = { errors: <ErrorJSON[]>[] };

      // Check if it was an array of errors
      if (Array.isArray(error)) {
        // Handle the errors
        error.forEach((err) => {
          response.errors.push(...handleError(err));
        });
      } else {
        // Handle the error
        response.errors.push(...handleError(error));
      }

      // Return the response
      res.status(400).json(response);
    },
    onNoMatch(req, res) {
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    },
    //-- Middlewares --//
  })
    .use(jwtMiddleware)
    .use(apiGuardMiddleware(options));
};
