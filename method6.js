import * as WEBIFC from "web-ifc";
import * as fs from "fs";

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
};

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
      totalQtys.push([key[0] + "0" + numbering.toString(), profile, "M", profileLength]);
      numbering += 1;
    }
  }
  return totalQtys;
};

const getLine = (expressID) => {
  return ifcApi.GetLine(modelID, expressID);
};

const getColumn = (element) => {
  const representationAttr = getLine(element.Representation.value);
  for (const handle of representationAttr.Representations) {
    const representation = getLine(handle.value);
    //if (count == 201) console.log(count, representation); //hepsi için aynı
    const shape = getLine(representation.Items[0].value);
    //console.log(shape);
    const repMap = getLine(shape.MappingSource.value);
    const source = getLine(repMap.MappedRepresentation.value);
    const sourceShape = getLine(source.Items[0].value);
    //console.log(sourceShape); // sourceShape.Depth.value (uzunluk değeri)
    //if (count == 200 || count == 201 || count == 252) console.log(count, source);
    if (source.RepresentationType.value !== "SweptSolid") return 0;
    const amount = sourceShape.Depth.value;
    return amount;
  }
};

const getBeam = (element) => {
  const representationAttr = getLine(element.Representation.value);
  const shapeRep = getLine(representationAttr.Representations[1].value);
  const extrusion = getLine(shapeRep.Items[0].value);
  const amount = extrusion.Depth.value;
  return amount;
};

//const getSlab = (element) => {
//  const representationAttr = getLine(element.Representation.value);
//  const shapeRep = getLine(representationAttr.Representations[0].value);
//  const extrusion = getLine(shapeRep.Items[0].value);
//  const sweptArea = getLine(extrusion.SweptArea.value);
//  const outerCurve = getLine(sweptArea.OuterCurve.value);
//  console.log(element);
//};

//const logTypes = (...sets) => {
//  for (const set of sets) {
//    for (const elem of set) console.log(elem);
//  }
//};

//[IFCTYPE , key text , getter function]

const ifcBuffer = fs.readFileSync("./HNS-CTL-MOD-EST-001.ifc");
const ifcApi = new WEBIFC.IfcAPI();
await ifcApi.Init();
const modelID = ifcApi.OpenModel(new Uint8Array(ifcBuffer));

const ifcTypes = [
  [WEBIFC.IFCBEAM, "Beams", getBeam],
  [WEBIFC.IFCCOLUMN, "Columns", getColumn],
];

const posList = getAllTypes(ifcTypes, modelID); //gets all lines for each type
const qtys = getQuatities(ifcTypes, posList); //calculates and returns quantities

export default qtys;
