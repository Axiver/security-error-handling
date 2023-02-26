import type { NextApiRequest, NextApiResponse } from "next";
import sibClient from "@sendinblue/client";
import { getSession } from "next-auth/react";

type Response = {
  success: boolean;
  message?: string;
};

type EmailRequestBody = {
  emailID: string;
  name: string;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
    return;
  }

  const session = await getSession({ req });
  if (!session || !session.user || session.user.role !== 0) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const { emailID, name, message }: EmailRequestBody = req.body;

  if (!emailID || !name || !message) {
    res.status(400).json({
      success: false,
      message: "Missing parameters",
    });
    return;
  }

  const apiInstance = new sibClient.TransactionalEmailsApi();
  const sendSmtpEmail = {
    to: [
      {
        email: emailID,
        name: name,
      },
    ],
    sender: {
      email: process.env.SIB_SENDER_EMAIL,
      name: process.env.SIB_SENDER_NAME,
    },
    subject: "Listing Alerts",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <body>
        <h1>Listing Alerts</h1>
        <p>Hi ${name},</p>
        <p>Here are the latest listings for you:</p>
        <p>${message}</p>
        <p><a href="http://localhost:3000/unsubscribe">Manage your alert preferences</a></p>
      </body>
      </html>
      `,
    params: {},
    headers: {},
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while sending the email.",
    });
  }
}
