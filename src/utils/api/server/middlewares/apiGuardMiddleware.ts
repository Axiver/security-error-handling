import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { APIRequestType } from "../apiHandler";

export type APIGuardOptions = {
  allowNonAuthenticated?: boolean;
  allowAdminsOnly?: boolean;
};

export const apiGuardMiddleware = (options?: APIGuardOptions) => {
  // Return the middleware function
  return async (req: APIRequestType, res: NextApiResponse, next: NextHandler) => {
    // Perform an auth check if required (defaults to true)
    if (!options?.allowNonAuthenticated) {
      // Check if the user is authenticated
      if (!req.token || !req.token.accessToken || !req.token.refreshToken) {
        // User is not authenticated
        // Throw an error
        throw "unauthenticated";
      }
    }

    // Perform an admin check if required (defaults to false)
    if (options?.allowAdminsOnly) {
      // Check if the user is an admin
      if (!req.token?.isAdmin) {
        // User is not an admin
        // Throw an error
        throw "unauthorized";
      }
    }

    // Continue to handle the request
    next();
  };
};
