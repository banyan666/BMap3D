import { EventEmitter } from "./EventEmitter.js";
export class Sizes extends EventEmitter {
  constructor({ canvas }) {
    super();
    this.canvas = canvas;
    this.pixelRatio = 2;
    this.init();
    this.handleResize = () => {
      this.init();
      this.emit("resize");
    };
    window.addEventListener("resize", this.handleResize);
  }
  init() {
    this.width = this.canvas.parentNode.offsetWidth;
    this.height = this.canvas.parentNode.offsetHeight;
    this.pixelRatio = this.pixelRatio || Math.min(window.devicePixelRatio, 2);
  }
  destroy() {
    window.removeEventListener("resize", this.handleResize);
    this.off("resize");
  }
}
