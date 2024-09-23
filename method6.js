import * as WEBIFC from "web-ifc";
import * as fs from "fs";

//Custom functions
const getAllTypes = (typeArray, modelID) => {
  const poses = {};
  for (const [ifcType, text] of typeArray) {
    const elements = ifcApi.GetLineIDsWithType(modelID, ifcType);
    let profiles = [];
    for (const expressID of elements) {
      const element = ifcApi.GetLine(modelID, expressID);
      const profile = element.ObjectType.value;
      if (profile.includes("Hormigón")) continue; //exclude concrete parts
      profiles.push(profile);
    }
    const set = new Set(profiles);
    poses[text] = set;
  }
  return poses;
}; //lists all profile types used

const getQuatities = (typeArray, posList) => {
  let totalQtys = [];
  for (const [type, key, func] of typeArray) {
    let numbering = 1;
    //console.log(key);
    const elements = ifcApi.GetLineIDsWithType(modelID, type);
    for (const profile of posList[key]) {
      //console.log(profile);
      let profileLength = 0;
      for (const expressID of elements) {
        const element = getLine(expressID);
        if (element.ObjectType.value !== profile) continue;
        const amount = func(element);
        profileLength += amount;
      }
      totalQtys.push(["S355JR", key[0] + "0" + numbering.toString(), profile, "M", profileLength]);
      numbering += 1;
    }
  }
  return totalQtys;
}; //calculates the total quantity for each profile

const getLine = (expressID) => {
  return ifcApi.GetLine(modelID, expressID);
}; //returns the line with the related entity

const getColumn = (element) => {
  const representationAttr = getLine(element.Representation.value);
  for (const handle of representationAttr.Representations) {
    const representation = getLine(handle.value);
    const shape = getLine(representation.Items[0].value);
    const repMap = getLine(shape.MappingSource.value);
    const source = getLine(repMap.MappedRepresentation.value);
    const sourceShape = getLine(source.Items[0].value);
    if (source.RepresentationType.value !== "SweptSolid") return 0;
    const amount = sourceShape.Depth.value;
    return amount;
  }
}; //returns the length of a single column

const getBeam = (element) => {
  const representationAttr = getLine(element.Representation.value);
  const shapeRep = getLine(representationAttr.Representations[1].value);
  const extrusion = getLine(shapeRep.Items[0].value);
  const amount = extrusion.Depth.value;
  return amount;
}; //returns the length of a single beam

const ifcBuffer = fs.readFileSync("./HNS-CTL-MOD-EST-001.ifc");
const ifcApi = new WEBIFC.IfcAPI();
await ifcApi.Init();
const modelID = ifcApi.OpenModel(new Uint8Array(ifcBuffer));

//[IFCTYPE , key text , function]
const ifcTypes = [
  [WEBIFC.IFCBEAM, "Beams", getBeam],
  [WEBIFC.IFCCOLUMN, "Columns", getColumn],
];

const posList = getAllTypes(ifcTypes, modelID); //lists all profile types used
const steelQty = getQuatities(ifcTypes, posList); //calculates and returns quantities

export default steelQty;
