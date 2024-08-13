import * as fs from "fs";
import * as WEBIFC from "web-ifc";
import { google } from "googleapis";
import { appUser } from "./app-user.js";

const ifcBuffer = fs.readFileSync("./sample.ifc");
const ifcApi = new WEBIFC.IfcAPI();
await ifcApi.Init();
const modelID = ifcApi.OpenModel(new Uint8Array(ifcBuffer));

const walls = ifcApi.GetLineIDsWithType(modelID, WEBIFC.IFCWALL);
let wallsArea = 0;

for (const expressID of walls) {
  const psets = await ifcApi.properties.getPropertySets(modelID, expressID);
  const baseQuantities = psets.find((set) => set.Name?.value.includes("BaseQuantities"));
  if (!baseQuantities) continue;

  const { Quantities } = baseQuantities;
  for (const handle of Quantities) {
    const qtoAttrs = ifcApi.GetLine(modelID, handle.value);
    if (qtoAttrs.Name?.value !== "NetSideArea") continue;
    const area = qtoAttrs.AreaValue?.value ?? 0;
    wallsArea += area;
  }
}

const sheets = google.sheets("v4");

sheets.spreadsheets.values.update({
  spreadsheetId: "1Kh6S9Kt8n6QO-EtcPRNRjGWXHU3rQAkq8ZhtxGU3Y58",
  auth: appUser,
  valueInputOption: "RAW",
  range: "Quantities!D2",
  requestBody: {
    values: [[wallsArea]],
  },
});
