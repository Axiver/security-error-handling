import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

export default nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, req, res) {
    // An error occurred
    console.log({ error });
    res.status(501).json({ error: "Sorry, something happened!" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  },
});
