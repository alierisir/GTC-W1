import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { CalculatedVolumeSetter } from "..";

export const calculatedVolumeSetterUI = (components:OBC.Components,world:OBC.World) => {

    
    const calculatedVolumeSetter = components.get(CalculatedVolumeSetter)
    const highlighter = components.get(OBF.Highlighter)


    const onComputeVolume = async () => {
        const selection = highlighter.selection.select
        if(Object.keys(selection).length===0) return
      await calculatedVolumeSetter.compute(world,selection)
      highlighter.clear("select")
    }
  return BUI.html`
  <bim-toolbar-section label="Calculations" icon="tabler:calculator-filled">
    <bim-button @click=${onComputeVolume} label="Compute Volume" icon="simple-icons:anycubic"></bim-button>
  </bim-toolbar-section>
  `
}