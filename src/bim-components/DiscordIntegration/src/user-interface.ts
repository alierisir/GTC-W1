import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import { DiscordIntegration } from "..";

export const discordIntegrationUI = (components: OBC.Components, world: OBC.World) => {
  const textInput = document.createElement("bim-text-input");
  const channelsInput = document.createElement("bim-dropdown");
  channelsInput.required = true;
  const discordIntegration = components.get(DiscordIntegration);

  discordIntegration.channels = {
    "Main Group":
      "https://discordapp.com/api/webhooks/1254353910244708392/ab0ddlEG4OwV_AZpm3NUz6-JcWakmZetag5WESA8j5lsd0EozvTb-gTR24ED4jg1_gyB",
    "Site Team":
      "https://discordapp.com/api/webhooks/1254521583909863495/CbtykwWplL4DQ37JsWBvVZRdO9aaOp6e7O6lURiC5XU2woqiE96mnrdQpTtqsqJ6tZav",
    "Design Team":
      "https://discordapp.com/api/webhooks/1254901699823403050/jo-4UroiD8BI1be7PTUeXQpp-JGiWD2OsTBlFJq5iqFgJxnBX3MTDydLixrFkfd--ZD3",
  };

  for (const channel in discordIntegration.channels) {
    const option = document.createElement("bim-option");
    option.label = channel;
    channelsInput.append(option);
  }
  const sendMessage = () => {
    if (textInput.value.trim() === "") return;
    discordIntegration.sendMessage(world, textInput.value, channelsInput.value[0]);
    textInput.value = "";
    modal.close();
  };

  const modal = BUI.Component.create<HTMLDialogElement>(() => {
    return BUI.html`
      <dialog>
        <bim-panel style="width: 20rem">
            <bim-panel-section label="Send Discord Message" fixed>
                <bim-label style="white-space:normal;">
                    The Message you write here will be sent to the Discord channel associated with this project based on the settings.
                </bim-label>
                ${channelsInput}
                ${textInput}
                <bim-button @click=${sendMessage} label="Send" icon="iconoir:send-diagonal-solid"></bim-button>
            </bim-panel-section>
        </bim-panel>
      </dialog>
      `;
  });

  document.body.append(modal);
  return BUI.html`
  <bim-button @click=${() => {
              modal.showModal();
            }} label="Send Message" icon="flowbite:discord-solid"></bim-button>`
};
