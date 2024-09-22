import * as WEBIFC from "web-ifc";
import * as fs from "fs";
import * as OBC from "@thatopen/components";

const buffer = fs.readFileSync("./HNS-CTL-MOD-EST-001.ifc");
const components = new OBC.Components();
const ifcLoader = components.get(OBC.IfcLoader);
const model = await ifcLoader.load(new Uint8Array(buffer));
const measurement = components.get(OBC.MeasurementUtils);

const slabProps = await model.getAllPropertiesOfType(WEBIFC.IFCSLAB);
const expressIDs = Object.keys(slabProps).map((expresID) => Number(expresID)); //string to number
const fragments = model.getFragmentMap(expressIDs);
const slabVolumes = measurement.getVolumeFromFragments(fragments);

const columns = await model.getAllPropertiesOfType(WEBIFC.IFCCOLUMN);

const columnsObjects = Object.values(columns);

let concreteColumnsIDs = [];
let profiles = [];
for (const column of columnsObjects) {
  const profile = column.ObjectType.value;
  if (!profile.includes("Hormigón")) continue;
  concreteColumnsIDs.push(column.expressID);
  profiles.push(profile);
}

const concreteFragments = model.getFragmentMap(concreteColumnsIDs);
const columnVolumes = measurement.getVolumeFromFragments(concreteFragments);

//([key[0] + "0" + numbering.toString(), profile, "M", profileLength]);

const concreteColumnQty = ["C35", "CC01", profiles[0], "M3", columnVolumes];
const concreteSlabQty = ["C35", "S01", "11cm Concrete Slab", "M3", slabVolumes];
const concreteQty = [concreteColumnQty, concreteSlabQty];

export default concreteQty;
