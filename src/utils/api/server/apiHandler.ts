import { BaseError, ParamError, ParamRequiredError, ParamTypeError } from "@/errors";
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
  // Retrieve the first error
  const err = error.errors[0];

  // Check if it was a type error
  if (err.code === "invalid_type") {
    // Yes it was
    // Check if it is due to a missing param
    if (err.received === "undefined") {
      // Yes it was, return a param error
      return new ParamRequiredError(err.path[0].toString());
    }

    // Return a param type error
    return new ParamTypeError(err.path[0].toString(), err.expected, err.received);
  }

  // Unrecognised zod error
  return new ParamError();
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

export default (options?: APIHandlerOptions) => {
  // Return the next-connect handler
  return nextConnect<APIRequestType, NextApiResponse>({
    //-- API error handling --//
    onError(error: Error, req, res) {
      // An error occurred
      // Check if it was a custom error
      if (error instanceof BaseError) {
        // Yes it was, return the error message
        res.status(error.status).json(error.toJSON());
        return;
      }

      // Check if it was a zod error
      if (error instanceof ZodError) {
        // We got a zod error
        const err: BaseError = handleZodError(error);

        // Return the error message
        res.status(err.status).json(err.toJSON());
        return;
      }

      // Check if it was a prisma error
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // We got a prisma error
        const err: BaseError = handlePrismaError(error);

        // Return the error message
        res.status(err.status).json(err.toJSON());
        return;
      }

      // Unknown error
      console.error(error);
      res.status(500);
    },
    onNoMatch(req, res) {
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    },
    //-- Middlewares --//
  })
    .use(jwtMiddleware)
    .use(apiGuardMiddleware(options));
};
