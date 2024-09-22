import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";
import * as fs from "fs";

const ifcBuffer = fs.readFileSync(`./HNS-CTL-MOD-EST-001.ifc`);
const components = new OBC.Components();

const ifcLoader = components.get(OBC.IfcLoader);

const model = await ifcLoader.load(new Uint8Array(ifcBuffer));

let volumes = [];
let areas = [];

const volumeTypes = ["IFCSLAB", "IFCBEAM", "IFCWALL"];

for (const type of volumeTypes) {
  const elems = await model.getAllPropertiesOfType(WEBIFC[type]);

  let expressIDs = [];
  for (const expressID in elems) {
    expressIDs.push(Number(expressID));
  }

  const fragments = model.getFragmentMap(expressIDs);

  const measurer = components.get(OBC.MeasurementUtils);

  const volume = measurer.getVolumeFromFragments(fragments);

  volumes.push(volume);
}

const logit = (arr1, arr2) => {
  for (let i = 0; i < arr1.length; i++) {
    console.log(arr1[i], arr2[i]);
  }
};

logit(volumeTypes, volumes);

export default volumes;
