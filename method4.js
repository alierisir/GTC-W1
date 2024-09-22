import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";
import * as fs from "fs";

const ifcBuffer = fs.readFileSync(`./HNS-CTL-MOD-EST-001.ifc`);
const components = new OBC.Components();
const ifcApi = new WEBIFC.IfcAPI();
await ifcApi.Init();
const modelID = ifcApi.OpenModel(new Uint8Array(ifcBuffer));

const ifcLoader = components.get(OBC.IfcLoader);

const model = await ifcLoader.load(new Uint8Array(ifcBuffer));

const types = model.getAllPropertiesTypes();

console.log(types);

for (const typeId of types) {
  const type = model.getAllPropertiesIDs(typeId);
  console.log(typeId, type);
}
