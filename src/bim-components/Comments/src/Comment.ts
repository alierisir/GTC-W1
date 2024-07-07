import * as OBC from "@thatopen/components";

import * as THREE from "three";
import { generateUUID } from "three/src/math/MathUtils.js";
export class Comment {
  id: string = generateUUID();
  text: string;
  position?: THREE.Vector3;
  replies: string[] = [];
  onReplyAdded = new OBC.Event<string>();
  constructor(text: string) {
    this.text = text;
  }

  addReply(text: string) {
    if (!(text && text.trim() !== "")) return;
    this.replies.push(text);
    this.onReplyAdded.trigger(text);
    return text;
  }
}
