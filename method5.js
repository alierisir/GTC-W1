import * as WEBIFC from "web-ifc";
import * as fs from "fs";

const ifcBuffer = fs.readFileSync(`./HNS-CTL-MOD-EST-001.ifc`);
const ifcApi = new WEBIFC.IfcAPI();
await ifcApi.Init();
const modelID = ifcApi.OpenModel(new Uint8Array(ifcBuffer));

const walls = ifcApi.GetLineIDsWithType(modelID, WEBIFC.IFCWALL);
//retrieves a list of express IDs for all elements in the model that are of type IFCWALL
let names = [];

for (const expressID of walls) {
  const wallAttrs = ifcApi.GetLine(modelID, expressID);
  if (!wallAttrs) {
    console.log(`Failed to get attributes of expressID ${expressID}`);
    continue;
  }
  const wallName = wallAttrs.Name?.value ?? "noname";
  if (names.includes(wallName)) continue;
  names.push(wallName);
}

console.log(names);

export default names;
