import * as WEBIFC from "web-ifc";
import * as fs from "fs";
import { google } from "googleapis";
import { appUser } from "./app-user.js";

const ifcBuffer = fs.readFileSync(`./sample.ifc`);
const ifcApi = new WEBIFC.IfcAPI();
await ifcApi.Init();
const modelID = ifcApi.OpenModel(new Uint8Array(ifcBuffer));

const walls = ifcApi.GetLineIDsWithType(modelID, WEBIFC.IFCWALL);
//retrieves a list of express IDs for all elements in the model that are of type IFCWALL
let wallsArea = 0;

for (const expressID of walls) {
  const wallAttrs = ifcApi.GetLine(modelID, expressID);
  if (!wallAttrs) {
    console.log(`Failed to get attributes of expressID ${expressID}`);
    continue;
  }

  const representationAttrs = ifcApi.GetLine(
    modelID,
    wallAttrs.Representation.value
  );

  for (const handle of representationAttrs.Representations) {
    const shapeAttrs = ifcApi.GetLine(modelID, handle.value);
    if (shapeAttrs.RepresentationType.value !== "SweptSolid") continue;
    const extrusion = ifcApi.GetLine(modelID, shapeAttrs.Items[0].value);
    const height = extrusion.Depth.value;
    const profile = ifcApi.GetLine(modelID, extrusion.SweptArea.value);
    const length = profile.XDim.value;
    const frontArea = length * height;
    wallsArea += frontArea;
  }
}

console.log(wallsArea);

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
