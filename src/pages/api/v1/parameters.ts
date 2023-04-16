import { apiHandler } from "@/utils/api";
import { parseToNumber } from "@/utils/stringUtils";
import PrismaClient from "@/utils/prisma";
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

//-- Type definitions --//
type parameter = {
  id?: number;
  name: string;
  displayName: string;
  type?: number;
  dataType?: number;
};

export default apiHandler({
  allowNonAuthenticated: true,
}).post(async (req, res) => {
  // Parse and validate the request body
  const data = paramsPostRequest.parse(req.body);

  // Initialise the parameter object
  const newParam: parameter = {
    name: data.name,
    displayName: data.displayName,
  };

  // Attempt to convert the type and dataType to numbers
  newParam.type = parseToNumber(data.type, "type");
  newParam.dataType = parseToNumber(data.dataType, "dataType");

  // Insert the parameter into the database
  const result = await PrismaClient.parameter.create({
    data: {
      name: newParam.name,
      display_name: newParam.displayName,
      type: newParam.type,
      datatype: newParam.dataType,
    },
  });

  // Return the result
  res.status(201).json({ parameterId: result.id });
});
