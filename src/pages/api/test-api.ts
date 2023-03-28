import { apiHandler } from "@/utils/api";

export default apiHandler({
  allowAdminsOnly: true,
}).get(async (req, res) => {
  console.log({ token: req.token });

  res.status(200).json({ success: true, message: "test complete" });
});
