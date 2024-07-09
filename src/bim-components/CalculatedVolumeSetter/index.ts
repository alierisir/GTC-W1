import * as OBC from "@thatopen/components"
import * as OBF from "@thatopen/components-front"
import * as FRAG from "@thatopen/fragments"

export class CalculatedVolumeSetter extends OBC.Component{
    enabled: boolean = false
    static uuid ="c7b631e9-e941-49a9-b720-86bd4a453b83" as const

    constructor(components:OBC.Components){
        super(components)
        components.add(CalculatedVolumeSetter.uuid,this)
    }

    private _processedElements : Record<string,Set<number>>={}

    async compute(world:OBC.World,fragmentIdMap:FRAG.FragmentIdMap,force:boolean=false){
        const fragments = this.components.get(OBC.FragmentsManager)
        const propertiesManager = this.components.get(OBC.IfcPropertiesManager)
        const volumeMeasurement = this.components.get(OBF.VolumeMeasurement)
        const indexer = this.components.get(OBC.IfcRelationsIndexer)
        volumeMeasurement.world=world
        for (const fragmentId in fragmentIdMap){
            const fragment = fragments.list.get(fragmentId)
            if(!(fragment && fragment.group)) continue
            const model = fragment.group 

            if(!(model.uuid in this._processedElements)){
                this._processedElements[model.uuid] = new Set()
            }

            const expressIds = fragmentIdMap[fragmentId]
            for (const expressId of expressIds){
                if(expressId in this._processedElements[model.uuid] && !force) continue
                const map = model.getFragmentMap([expressId])
                const volume = volumeMeasurement.getVolumeFromFragments(map)
                const {pset} = await propertiesManager.newPset(model,"CalculatedQuantities")
                const volumeProperty = await propertiesManager.newSingleNumericProperty(model,"IfcReal","Volume",volume)
                
                await propertiesManager.addPropToPset(model,pset.expressID,volumeProperty.expressID)

                await propertiesManager.addElementToPset(model,pset.expressID,expressId)

                const relations = indexer.getEntityRelations(model,expressId,"IsDefinedBy")

                relations?.push(pset.expressID)

                this._processedElements[model.uuid].add(expressId)
            }
        }
    }
}