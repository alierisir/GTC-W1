import * as WEBIFC from "web-ifc";
import * as fs from "fs";

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

  const representationAttrs = ifcApi.GetLine(modelID, wallAttrs.Representation.value);

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

export default wallsArea;
