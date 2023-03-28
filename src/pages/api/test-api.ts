import { apiHandler } from "@/utils/api";

export default apiHandler().get(async (req, res) => {
  console.log({ token: req.token });

  res.status(200).json({ success: true, message: "test complete" });
});
