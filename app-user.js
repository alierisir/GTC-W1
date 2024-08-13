import * as fs from "fs";
import { google } from "googleapis";

const jsonKeys = fs.readFileSync(`./keys.json`).toString();
const gsheetsKeys = JSON.parse(jsonKeys);

const email = gsheetsKeys.client_email;
const key = gsheetsKeys.private_key.replace(/\\n/g, "\n");

const appUser = new google.auth.JWT({
  email,
  key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export { appUser };
