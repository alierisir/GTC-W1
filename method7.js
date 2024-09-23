import * as WEBIFC from "web-ifc";
import * as fs from "fs";
import * as OBC from "@thatopen/components";

const buffer = fs.readFileSync("./HNS-CTL-MOD-EST-001.ifc");
const components = new OBC.Components();
const ifcLoader = components.get(OBC.IfcLoader);
const model = await ifcLoader.load(new Uint8Array(buffer));
const measurement = components.get(OBC.MeasurementUtils);

//All slabs are concrete
const slabProps = await model.getAllPropertiesOfType(WEBIFC.IFCSLAB); //IfcProperties of slabs
const expressIDs = Object.keys(slabProps).map((expresID) => Number(expresID)); //expressIDs as number
const slabFragments = model.getFragmentMap(expressIDs); // fragmentIdMap of related expressIDs
const slabVolumes = measurement.getVolumeFromFragments(slabFragments); // volumes calculated by fragment

//Columns are of two types: steel and reinforced concrete
const columnProps = await model.getAllPropertiesOfType(WEBIFC.IFCCOLUMN); //IfcProperties of columns
const columns = Object.values(columnProps); //making columns iterable to be filtered

let concreteColumnsIDs = []; //list for storing concrete columns expressID's
let profiles = []; //list for storing different sections of concrete columns

for (const column of columns) {
  const profile = column.ObjectType.value; //profile or section name of a column
  if (!profile.includes("Hormigón")) continue; //filter concrete columns
  concreteColumnsIDs.push(column.expressID); // expressIDs of concrete columns
  profiles.push(profile); // list of different profiles or sections
}

const concreteFragments = model.getFragmentMap(concreteColumnsIDs); //fragmentIdMap of related expressIDs
const columnVolumes = measurement.getVolumeFromFragments(concreteFragments); // volumes calculated by fragment

//Data to be passed in a structured format for googlesheets
//Some values are hard coded for this model only, it can be improved.
//[Material, prefix + numbering, profile, unit , qty];

const concreteColumnQty = ["C35", "CC01", profiles[0], "M3", columnVolumes];
const concreteSlabQty = ["C35", "S01", "Concrete Slab", "M3", slabVolumes];
const concreteQty = [concreteColumnQty, concreteSlabQty];

export default concreteQty;
