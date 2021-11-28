const fx = require('glfx-es6');

export default class Wavifier {
    src: HTMLCanvasElement;
    glcanvas: any;
    srcCtx: any;
    texture: any;
    
    // https://stackoverflow.com/questions/33874947/fake-crt-effect-on-canvas/33875171
    constructor(src: HTMLCanvasElement) {
        this.src = src;

        this.glcanvas = fx.canvas();
        this.srcCtx = this.src.getContext('2d');
        this.texture = this.glcanvas.texture(src);

        this.src.parentNode.insertBefore(this.glcanvas, this.src);
        this.src.style.display = "none";
        this.glcanvas.className = this.src.className;

        requestAnimationFrame(this.draw);
    }

    draw = () => {
        this.texture.loadContentsOf(this.src);

        this.glcanvas.draw(this.texture)
            .swirl(this.src.width / 2, this.src.height / 2, 
                this.src.width, Math.sin(performance.now() / 400))
            .update();

        requestAnimationFrame(this.draw);
    }
}