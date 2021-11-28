import BeatMap from "./beatmap";

export const APPROACH_SECONDS = 0.75;
const SCANLINE_Y = 500;

export default class RhythmGame {
    canvas: HTMLCanvasElement;
    beatmap: BeatMap;
    startTime: Number;
    audioCtx: AudioContext;
    constructor(canvas: HTMLCanvasElement, beatmap: BeatMap, startTime: Number, 
        audioCtx: AudioContext) {
        this.canvas = canvas;
        this.beatmap = beatmap;
        this.startTime = startTime;
        this.audioCtx = audioCtx;

        requestAnimationFrame(this.draw);
    }

    draw = () => {
        let ctx = this.canvas.getContext('2d');
        let currTime = this.audioCtx.currentTime - <number>this.startTime;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = 'rgb(255, 0, 0)';
        ctx.fillRect(0, SCANLINE_Y, this.canvas.width, 1);
        
        for(let note of this.beatmap.notes) {
            let time = <number>note.time;
            let buttonId = <number>note.buttonId;
            if(currTime > time && currTime < time + APPROACH_SECONDS) {
                ctx.fillRect(buttonId * 200, 
                    (currTime - time) / APPROACH_SECONDS * SCANLINE_Y - 25, 50, 50);
            }
        }

        requestAnimationFrame(this.draw);
    }
}