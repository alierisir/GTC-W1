import { google } from "googleapis";
import { appUser } from "./app-user.js";
import qtys from "./method6.js";

const sheets = google.sheets("v4");

sheets.spreadsheets.values.update({
  spreadsheetId: "1Kh6S9Kt8n6QO-EtcPRNRjGWXHU3rQAkq8ZhtxGU3Y58",
  auth: appUser,
  valueInputOption: "RAW",
  range: "Quantities!A2",
  requestBody: {
    values: [...qtys],
  },
});
