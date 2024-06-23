import * as OBC from "@thatopen/components";

interface DiscordIntegrationConfig {
  webhookURL: string | null;
}

export class DiscordIntegration extends OBC.Component implements OBC.Configurable<DiscordIntegrationConfig> {
  static uuid = "8b91a773-0209-4052-a296-666bc2410273" as const;
  enabled = false;

  constructor(components: OBC.Components) {
    super(components);
    components.add(DiscordIntegration.uuid, this);
  }

  config: Required<DiscordIntegrationConfig> = {
    webhookURL: null,
  };

  private _xhr = new XMLHttpRequest();

  setup(config?: Partial<DiscordIntegrationConfig>) {
    if (this.isSetup) return;
    this.config = { ...this.config, ...config };
    const _config = { ...this.config };
    const openConnection = (url: string) => {
      this._xhr.open("POST", url);
    };

    Object.defineProperty(this.config, "webhookURL", {
      get() {
        return this._webhookURL;
      },
      set(url: string | null) {
        this._webhookURL = url;
        if (url) openConnection(url);
      },
    });

    this.config.webhookURL = _config.webhookURL;
    this.enabled = true;
    this.isSetup = true;
    this.onSetup.trigger(this);
  }

  isSetup = false;
  onSetup = new OBC.Event<DiscordIntegration>();

  sendMessage(world: OBC.World, message: string) {
    if (!this.isSetup) {
      throw new Error("DiscordIntegration: the component is not setup yet!");
    }
    if (!(this.enabled && this.config.webhookURL)) return;
    const { renderer, scene, camera } = world;
    if (!renderer) {
      throw new Error("DiscordIntegration: your world needs a renderer to send messages!");
    }
    const canvas = renderer.three.domElement;
    renderer.three.render(scene.three, camera.three);
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const file = new File([blob], "screenshot.png");
      const data = new FormData();
      data.set("content", message);
      data.set("screenshot", file);
      this._xhr.send(data);
    });
  }

  sendText(message: string) {
    if (!this.isSetup) {
      throw new Error("DiscordIntegration: the component is not setup yet!");
    }
    const data = new FormData();
    data.set("content", message);
    this._xhr.send(data);
  }
}

export * from "./src";
