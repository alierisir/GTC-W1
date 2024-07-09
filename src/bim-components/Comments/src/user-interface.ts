import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { Comments } from "..";

export const commentsUI = (components: OBC.Components, world: OBC.World) => {
  const comments = components.get(Comments);

  comments.onCommentAdded.add((comment) => {
    if (!comment.position) return;
    const commentBubble = BUI.Component.create(() => {
      const commentsTable = document.createElement("bim-table");
      commentsTable.headersHidden = true;
      commentsTable.expanded = true;

      const setTableData = () => {
        const groupData: BUI.TableGroupData = {
          data: { Comment: comment.text },
        };
        commentsTable.data = [groupData];

        if (comment.replies.length > 0) {
          groupData.children = comment.replies.map<BUI.TableGroupData>((reply) => {
            return {
              data: { Comment: reply },
            };
          });
        }
      };

      comment.onReplyAdded.add(() => {
        console.log("table updated");
        setTableData();
      });

      const onAddReplyClicked = () => {
        const text = prompt("Reply");
        if (!(text && text.trim() !== "")) return;
        comment.addReply(text);
      };

      setTableData();

      return BUI.html`
        <div>
         <bim-panel style="min-width:0; max-width:20rem; max-height:20rem;border-radius:1rem;">
          <bim-panel-section icon="material-symbols:comment" collapsed>
            ${commentsTable}  
          <bim-button id=${comment.id} @click=${onAddReplyClicked} label="Add reply"></bim-button>
          </bim-panel-section>
         </bim-panel>
        </div>
        `;
    });
    const commentMark = new OBF.Mark(world, commentBubble);
    commentMark.three.position.copy(comment.position);
    const btn = document.getElementById("comment-activation-btn") as BUI.Button;
    btn.click();
  });

  const onCommentsEnabled = (e: Event) => {
    const btn = e.target as BUI.Button;
    btn.active = !btn.active;
    comments.enabled = btn.active;
  };

  return BUI.html`
    <bim-button id="comment-activation-btn" label="Activate Comments" icon="mi:add" @click=${onCommentsEnabled} ></bim-button>
    `;
};
