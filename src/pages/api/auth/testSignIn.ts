import PrismaClient from "@prisma/client";
import bcrypt from "bcryptjs";
import apiHandler from "@/utils/api/server/apiHandler";

export default apiHandler({
  allowNonAuthenticated: true,
}).post(async (req, res) => {
  const prisma = new PrismaClient.PrismaClient();

  const user = await prisma.users.findUnique({
    where: {
      email: "karandeepsingh00@icloud.com",
    },
  });

  if (user && user.password) {
    // Check  if the password is correct
    const isPasswordCorrect = await bcrypt.compare("testtesttest", user.password);

    if (isPasswordCorrect) {
      res.status(200).json({ success: true, message: "Logged in" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});
