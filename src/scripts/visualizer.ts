const Uint8Array = window.Uint8Array;

export default class Visualizer {
    canvas: HTMLCanvasElement;
    analyzer: AnalyserNode;
    constructor(canvas: HTMLCanvasElement, analyzer: AnalyserNode) {
        this.canvas = canvas;
        this.analyzer = analyzer;

        requestAnimationFrame(this.draw);
    }

    draw = () => {
        let dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteFrequencyData(dataArray);

        const visualizerCtx = this.canvas.getContext('2d');
        visualizerCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        visualizerCtx.fillStyle = 'rgb(200, 200, 200)';

        const barWidth = this.canvas.width / this.analyzer.frequencyBinCount;
        
        for(let i = 0; i < this.analyzer.frequencyBinCount; i++) {
          visualizerCtx.fillRect(i * barWidth, 0, barWidth, 
            this.canvas.height - dataArray[i] / 256 * this.canvas.height);
        }

        requestAnimationFrame(this.draw);
    }
}