import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import { Comments } from "..";

export const commentsUI = (components:OBC.Components) =>{
    const comments = components.get(Comments)

    const onCommentsEnabled = (e:Event) => {
      const btn = e.target as BUI.Button
      btn.active = !btn.active
      comments.enabled=btn.active
    }

    return BUI.html`
        <bim-toolbar-section label="Communication" icon="fe:comment">
            <bim-button label="Add Comments" icon="mi:add" @click=${onCommentsEnabled} ></bim-button>
        </bim-toolbar-section>`
}