// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";

export const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    projectId: process.env.PROJECT_ID,
    credentials: {
      private_key: process.env.PRIVATE_KEY,
      client_email: process.env.CLIENT_EMAIL,
    },
  });

  const sheets = google.sheets({ version: "v4", auth });

  const range = "'Form Responses 1'";

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range,
  });

  const data = response.data.values;

  if (!data) {
    res.send("empty_sheet");
    return;
  }

  const firstRow = data[0];
  const lastRow = data[data.length - 1];

  console.log(lastRow);
  res.send({ schema: firstRow, lastRow });
}
