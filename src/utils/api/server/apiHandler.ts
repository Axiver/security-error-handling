import { NextApiRequest, NextApiResponse } from "next";
import { JWT } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";
import nextConnect from "next-connect";
import { jwtMiddleware } from "./middlewares/jwtMiddleware";

//-- Type definitions --//
// Define the type of the request object
export type APIRequestType = NextApiRequest & {
  token?: JWT | null;
};

export default nextConnect<APIRequestType, NextApiResponse>({
  //-- API error handling --//
  onError(error, req, res) {
    // An error occurred
    console.log({ error });
    res.status(501).json({ error: "Sorry, something happened!" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  },
  //-- Invoked upon every request --//
}).use(jwtMiddleware);
