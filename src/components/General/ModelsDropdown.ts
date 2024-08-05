import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";

export const modelsDropdown = (components: OBC.Components) => {
  const fragManager = components.get(OBC.FragmentsManager);
  const propManager = components.get(OBC.IfcPropertiesManager);
  let modelID: string | null = null;

  const onDownloadModel = () => {
    if (!modelID) return console.log("modelID is not valid!");
    const model = fragManager.groups.get(modelID);
    if (!model) return console.log("model is not found!");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = `.ifc`;
    input.addEventListener("change", async () => {
      if (input.files && input.files.length !== 0) {
        const ifcFile = input.files[0];
        const buffer = await ifcFile.arrayBuffer();
        const typedArray = new Uint8Array(buffer);
        const modifiedIFC = await propManager.saveToIfc(model, typedArray);
        const modifiedFile = new File([modifiedIFC], `modified-${ifcFile.name}`);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(modifiedFile);
        a.download = modifiedFile.name;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    });
    input.click();
  };

  const [dropdown, updateDropdown] = BUI.Component.create(
    (state: { components: OBC.Components }) => {
      const components = state.components;
      const fragManager = components.get(OBC.FragmentsManager);
      const modelsList = document.createElement("bim-dropdown");
      modelsList.addEventListener("change", () => {
        modelID = modelsList.value[0];
      });
      const models = fragManager.groups;
      for (const [id, model] of models) {
        const option = document.createElement("bim-option");
        option.label = model.name;
        option.value = id;
        modelsList.append(option);
      }

      return BUI.html`
      <div style="display: flex; gap: 0.5rem">
          ${modelsList}
          <bim-button @click=${onDownloadModel} icon="material-symbols:add-notes" style="flex-grow: 0;" label="Update IFC"></bim-button>
      </div>`;
    },
    { components }
  );

  fragManager.onFragmentsLoaded.add(() => {
    setTimeout(() => {
      updateDropdown();
    });
  });

  fragManager.onFragmentsDisposed.add(() => {
    setTimeout(() => {
      updateDropdown();
    });
  });

  return dropdown;
};
