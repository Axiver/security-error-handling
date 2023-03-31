import { AuthError, ForbiddenError, TokenExpiredError } from "@/errors/AuthError";
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
        throw new AuthError();
      }

      // User is authenticated, check if the access token has expired
      if (new Date() >= new Date(req.token.accessTokenExpires)) {
        // The access token is invalid
        // Throw an error
        throw new TokenExpiredError("access");
      }
    }

    // Perform an admin check if required (defaults to false)
    if (options?.allowAdminsOnly) {
      // Check if the user is an admin
      if (!req.token?.isAdmin) {
        // User is not an admin
        // Throw an error
        throw new ForbiddenError(req.token?.name);
      }
    }

    // Continue to handle the request
    next();
  };
};
