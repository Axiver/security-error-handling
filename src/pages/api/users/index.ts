import PrismaClient from "../../../utils/prisma";
import apiHandler from "@/utils/apiHandler";

export default apiHandler.get(async (req, res) => {
  let response = await PrismaClient.users.findMany();

  return res.status(200).json({ data: response });
});
