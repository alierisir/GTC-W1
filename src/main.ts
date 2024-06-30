import { DiscordIntegration, discordIntegrationUI } from "./bim-components/DiscordIntegration/index";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import projectInformation from "./components/Panels/ProjectInformation";
import elementData from "./components/Panels/Selection";
import settings from "./components/Panels/Settings";
import load from "./components/Toolbars/Sections/Import";
import camera from "./components/Toolbars/Sections/Camera";
import selection from "./components/Toolbars/Sections/Selection";
import { AppManager } from "./bim-components";

BUI.Manager.init();

const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);

const world = worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>();
world.name = "Main";

world.scene = new OBC.SimpleScene(components);
world.scene.setup();
world.scene.three.background = null;

const viewport = BUI.Component.create<BUI.Viewport>(() => {
  return BUI.html`
    <bim-viewport>
      <bim-grid floating></bim-grid>
    </bim-viewport>
  `;
});

world.renderer = new OBF.PostproductionRenderer(components, viewport);
const { postproduction } = world.renderer;

world.camera = new OBC.OrthoPerspectiveCamera(components);

const worldGrid = components.get(OBC.Grids).create(world);
worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242);
worldGrid.material.uniforms.uSize1.value = 2;
worldGrid.material.uniforms.uSize2.value = 8;

const resizeWorld = () => {
  world.renderer?.resize();
  world.camera.updateAspect();
};

viewport.addEventListener("resize", resizeWorld);

components.init();

postproduction.enabled = true;
postproduction.customEffects.excludedMeshes.push(worldGrid.three);
postproduction.setPasses({ custom: true, ao: true, gamma: true });
postproduction.customEffects.lineColor = 0x17191c;

const appManager = components.get(AppManager);
const viewportGrid = viewport.querySelector<BUI.Grid>("bim-grid[floating]")!;
appManager.grids.set("viewport", viewportGrid);

const fragments = components.get(OBC.FragmentsManager);
const indexer = components.get(OBC.IfcRelationsIndexer);
const classifier = components.get(OBC.Classifier);
classifier.list.CustomSelections = {};

const ifcLoader = components.get(OBC.IfcLoader);
await ifcLoader.setup();

const tilesLoader = components.get(OBF.IfcStreamer);
tilesLoader.url = "../resources/tiles/";
tilesLoader.world = world;
tilesLoader.culler.threshold = 10;
tilesLoader.culler.maxHiddenTime = 1000;
tilesLoader.culler.maxLostTime = 40000;

const highlighter = components.get(OBF.Highlighter);
highlighter.setup({ world });
highlighter.zoomToSelection = true;
highlighter.config.selectionColor.setRGB(255 / 255, 153 / 255, 0 / 255);
highlighter.config.hoverColor.setRGB(36 / 255, 74 / 255, 241 / 255);

//const culler = components.get(OBC.Cullers).create(world);
//culler.threshold = 50;

world.camera.controls.restThreshold = 0.25;
world.camera.controls.addEventListener("rest", () => {
  //culler.needsUpdate = true;
  tilesLoader.culler.needsUpdate = true;
});

fragments.onFragmentsLoaded.add(async (model) => {
  if (model.hasProperties) {
    await indexer.process(model);
    classifier.byEntity(model);
  }

  for (const fragment of model.items) {
    world.meshes.add(fragment.mesh);
    //culler.add(fragment.mesh);
  }

  world.scene.three.add(model);
  setTimeout(async () => {
    world.camera.fit(world.meshes, 0.8);
  }, 50);
});

const projectInformationPanel = projectInformation(components);
const elementDataPanel = elementData(components);

const discordIntegration = new DiscordIntegration(components);
discordIntegration.setup();

discordIntegration.channels = {
  "Main Group":
    "https://discordapp.com/api/webhooks/1254353910244708392/ab0ddlEG4OwV_AZpm3NUz6-JcWakmZetag5WESA8j5lsd0EozvTb-gTR24ED4jg1_gyB",
  "Site Team":
    "https://discordapp.com/api/webhooks/1254521583909863495/CbtykwWplL4DQ37JsWBvVZRdO9aaOp6e7O6lURiC5XU2woqiE96mnrdQpTtqsqJ6tZav",
  "Design Team":
    "https://discordapp.com/api/webhooks/1254901699823403050/jo-4UroiD8BI1be7PTUeXQpp-JGiWD2OsTBlFJq5iqFgJxnBX3MTDydLixrFkfd--ZD3",
};

const toolbar = BUI.Component.create(() => {
  return BUI.html`
    <bim-toolbar>
      ${load(components)}
      ${camera(world)}
      ${selection(components, world)}
      ${discordIntegrationUI(components, world)}
    </bim-toolbar>
  `;
});

const rightPanel = BUI.Component.create(() => {
  return BUI.html`
    <bim-tabs switchers-full>
      <bim-tab name="project" label="Project" icon="ph:building-fill">
        ${projectInformationPanel}
      </bim-tab>
      <bim-tab name="settings" label="Settings" icon="solar:settings-bold">
        ${settings(components)}
      </bim-tab>
    </bim-tabs> 
  `;
});

const app = document.getElementById("app") as BUI.Grid;
app.layouts = {
  main: {
    template: `
      "viewport rightPanel" 1fr
      /1fr 20rem
    `,
    elements: {
      rightPanel,
      viewport,
    },
  },
};

app.layout = "main";

viewportGrid.layouts = {
  main: {
    template: `
      "empty" 1fr
      "toolbar" auto
      /1fr
    `,
    elements: { toolbar },
  },
  second: {
    template: `
      "empty elementDataPanel" 1fr
      "toolbar elementDataPanel" auto
      /1fr 24rem
    `,
    elements: {
      toolbar,
      elementDataPanel,
    },
  },
};

viewportGrid.layout = "main";
