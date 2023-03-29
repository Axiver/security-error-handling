import PrismaClient from "../../../utils/prisma";
import apiHandler from "@/utils/apiHandler";

export default apiHandler.get(async (req, res) => {
  const id: string = req.query.id;
  console.log(typeof id);
  if (typeof id !== "string") {
    return res.status(422).json({ status: 422, detail: "unprocessable id" });
  }

  let response = await PrismaClient.users.findUnique({
    where: {
      id: id,
    },
  });

  if (!response) {
    return res.status(404).json({ status: 404, detail: "user not found" });
  }

  return res.status(200).json(response);
});
