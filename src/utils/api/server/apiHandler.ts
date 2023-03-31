import { BaseError } from "@/errors";
import { NextApiRequest, NextApiResponse } from "next";
import { JWT } from "next-auth/jwt";
import nextConnect from "next-connect";
import { apiGuardMiddleware, APIGuardOptions } from "./middlewares/apiGuardMiddleware";
import { jwtMiddleware } from "./middlewares/jwtMiddleware";

//-- Type definitions --//
// Define the type of the request object
export type APIRequestType = NextApiRequest & {
  token?: JWT | null;
};

// Define the type of the options object
type APIHandlerOptions = {} & APIGuardOptions;

export default (options?: APIHandlerOptions) => {
  // Return the next-connect handler
  return nextConnect<APIRequestType, NextApiResponse>({
    //-- API error handling --//
    onError(error: BaseError, req, res) {
      // An error occurred
      console.log({ serverError: error });
      res.status(error.status).json({ error: error.message });
    },
    onNoMatch(req, res) {
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    },
    //-- Middlewares --//
  })
    .use(jwtMiddleware)
    .use(apiGuardMiddleware(options));
};
