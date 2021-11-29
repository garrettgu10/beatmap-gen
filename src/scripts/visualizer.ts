const Uint8Array = window.Uint8Array;

class Ball {
    constructor(
        public x: number,
        public y: number,
        public radius: number,
        public color: string,
        public direction: number,
    ) {}

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    move(speed: number) {
        this.x += Math.cos(this.direction) * speed;
        this.y += Math.sin(this.direction) * speed;

        if(this.x < 0) {
            this.x = 800;
        }else if(this.x > 800) {
            this.x = 0;
        }

        if(this.y < 0) {
            this.y = 600;
        }else if(this.y > 600) {
            this.y = 0;
        }
    }
}

export default class Visualizer {
    canvas: HTMLCanvasElement;
    analyzer: AnalyserNode;
    balls: Array<Ball>;

    constructor(canvas: HTMLCanvasElement, analyzer: AnalyserNode) {
        this.canvas = canvas;
        this.analyzer = analyzer;

        this.balls = [];
        for(let i = 0; i < this.analyzer.frequencyBinCount; i++) {
            this.balls[i] = new Ball(Math.random() * 800, Math.random() * 600, 10, 
            '#' + Math.floor(Math.random() * 16777215).toString(16), Math.random() * 2 * Math.PI);
        }

        requestAnimationFrame(this.draw);
    }

    draw = () => {
        let dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteFrequencyData(dataArray);

        const visualizerCtx = this.canvas.getContext('2d');
        visualizerCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        visualizerCtx.fillStyle = 'rgba(200, 200, 200, 50)';

        const barWidth = this.canvas.width / this.analyzer.frequencyBinCount;
        
        for(let i = 0; i < this.analyzer.frequencyBinCount; i++) {
          visualizerCtx.fillRect(i * barWidth, 0, barWidth, 
            this.canvas.height - dataArray[i] / 256 * this.canvas.height);
        }

        this.balls.forEach((ball, idx) => {
            ball.move(dataArray[idx] / 255 * 3);
            ball.radius = dataArray[idx] / 255 * 150;

            ball.draw(visualizerCtx);
        });

        requestAnimationFrame(this.draw);
    }
}