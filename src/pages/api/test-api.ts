import { ApiError } from "@/errors";
import { apiHandler } from "@/utils/api";

export default apiHandler().get(async (req, res) => {
  res.status(200).json({ success: true, message: "test complete" });
});
