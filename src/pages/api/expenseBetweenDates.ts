import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const QueryParametersSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

const parseQuery = (query: unknown) => {
  return QueryParametersSchema.parse(query);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: SCOPES,
      projectId: process.env.PROJECT_ID,
      credentials: {
        private_key: process.env.PRIVATE_KEY,
        client_email: process.env.CLIENT_EMAIL,
      },
    });

    const parsedQuery = parseQuery(req.query);

    const sheets = google.sheets({ version: "v4", auth });
    const range = "'Form Responses 1'!A:F";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range,
    });
    const data = response.data.values;

    if (!data) {
      res.status(404).json({ message: "No data found in the spreadsheet." });
      return;
    }

    const fromDate = new Date(parsedQuery.from);
    const toDate = new Date(parsedQuery.to);

    const filteredData = data.filter((expense) => {
      const date = new Date(expense[0]);
      return date >= fromDate && date < toDate;
    });

    res.status(200).send(filteredData);
  } catch (error) {
    console.error("Error fetching data from spreadsheet:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
