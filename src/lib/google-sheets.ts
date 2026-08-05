import "server-only";

import { google } from "googleapis";

export type FeedbackSheetRow = {
  timestamp: string;
  name: string;
  email: string;
  contact: string;
  category: string;
  feedback: string;
};

/** Prevent spreadsheet formula injection from user-controlled cells. */
function sanitizeCell(value: string): string {
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

function getSheetsConfig() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const tabName = process.env.GOOGLE_SHEETS_TAB_NAME?.trim() || "Feedback";

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error(
      "Google Sheets is not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEETS_SPREADSHEET_ID.",
    );
  }

  return { clientEmail, privateKey, spreadsheetId, tabName };
}

export async function appendFeedbackRow(row: FeedbackSheetRow): Promise<void> {
  const { clientEmail, privateKey, spreadsheetId, tabName } = getSheetsConfig();

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const range = `${tabName}!A:F`;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          sanitizeCell(row.timestamp),
          sanitizeCell(row.name),
          sanitizeCell(row.email),
          sanitizeCell(row.contact),
          sanitizeCell(row.category),
          sanitizeCell(row.feedback),
        ],
      ],
    },
  });
}
