// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import PrismaClient from "../../../utils/prisma";
import bcrypt from "bcryptjs";
import apiHandler from "@/utils/api/server/apiHandler";

export default apiHandler({
  allowNonAuthenticated: true,
}).post(async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !email.includes("@") || !password || password.trim().length < 8) {
    res.status(422).json({ success: false, message: "Invalid input" });
    return;
  }

  // Check if user already exists
  const existingUser = await PrismaClient.users.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    res.status(422).json({ success: false, message: "User already exists" });
    return;
  }

  // Generate salt with 10 rounds
  const salt = await bcrypt.genSalt(10);

  // Hash password with bcrypt
  const hashedPassword = await bcrypt.hash(password, salt);

  let response = await PrismaClient.users.create({
    data: {
      name: name,
      email: email,
      image: null,
      password: hashedPassword,
      permissions: 0,
      companyid: 1,
    },
  });

  if (response.id) {
    res.status(201).json({ success: true, message: "User created" });
  } else {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});
