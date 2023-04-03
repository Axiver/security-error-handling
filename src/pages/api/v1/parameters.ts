import { apiHandler } from "@/utils/api";
import { z } from "zod";

/**
 * Zod schema for the POST request body
 */
export const paramsPostRequest = z.object({
  // Define the request body schema
  name: z.string(),
  displayName: z.string(),
  type: z.string(),
  dataType: z.string(),
});

export default apiHandler({
  allowNonAuthenticated: true,
}).post(async (req, res) => {
  // Parse and validate the request body
  const data = paramsPostRequest.parse(req.body);

  res.status(200).json({ success: true, message: "test complete" });
});
