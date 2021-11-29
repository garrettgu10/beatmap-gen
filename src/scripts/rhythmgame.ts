import BeatMap from "./beatmap";

export const APPROACH_SECONDS = 0.75;
const SCANLINE_Y = 500;

const NOTE_LENIENCY = 0.1;
const SLIDER_LENIENCY = 0.03;

class Scorer {
    currScore: number = 0;

    increaseScore(diff: number) {
        this.currScore += diff;
        document.getElementById("score").innerHTML = this.currScore.toString();
    }
}

class FadeOutNote {
    startTime: number;
    endTime: number;
    noteIdx: number;
    color: string;

    constructor(startTime: number, endTime: number, noteIdx: number, color: string = "255, 0, 0") {
        this.startTime = startTime;
        this.endTime = endTime;
        this.noteIdx = noteIdx;
        this.color = color;
    }

    draw(currTime: number, ctx: CanvasRenderingContext2D) {
        const opacity = 1 - (currTime - this.startTime) / (this.endTime - this.startTime);

        ctx.fillStyle = `rgba(${this.color}, ${opacity})`;

        const width = 50 + (1 - opacity) * 50;

        ctx.fillRect(this.noteIdx * 200 + 125 - width/2, SCANLINE_Y - width/2, width, width);
    }
}

export default class RhythmGame {
    canvas: HTMLCanvasElement;
    beatmap: BeatMap;
    startTime: Number;
    audioCtx: AudioContext;
    fadeOutNotes: Array<FadeOutNote> = [];
    scorer: Scorer = new Scorer();
    heldKeys: Set<Number> = new Set<Number>();

    constructor(canvas: HTMLCanvasElement, beatmap: BeatMap, startTime: Number, 
        audioCtx: AudioContext) {
        this.canvas = canvas;
        this.beatmap = beatmap;
        this.startTime = startTime;
        this.audioCtx = audioCtx;

        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);

        requestAnimationFrame(this.handleSliders);

        requestAnimationFrame(this.draw);
    }

    handleSliders = () => {
        let currTime = this.audioCtx.currentTime - <number>this.startTime;

        for(let note of this.beatmap.sliders) {
            if(Math.abs(currTime - <number>note.time - APPROACH_SECONDS) < SLIDER_LENIENCY && this.heldKeys.has(note.buttonId)) {
                this.scorer.increaseScore(100);
                this.fadeOutNotes.push(new FadeOutNote(currTime, currTime + 0.2, note.buttonId, "0, 0, 255"));
                note.hidden = true;
            }
        }
        requestAnimationFrame(this.handleSliders);
    }

    draw = () => {
        let ctx = this.canvas.getContext('2d');
        let currTime = this.audioCtx.currentTime - <number>this.startTime;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = 'rgb(255, 0, 0)';
        ctx.fillRect(0, SCANLINE_Y, this.canvas.width, 1);
        
        for(let note of this.beatmap.notes) {
            if(note.hidden) continue;
            let time = <number>note.time;
            let buttonId = <number>note.buttonId;
            if(currTime > time && currTime < time + APPROACH_SECONDS + 1) {
                ctx.fillRect(buttonId * 200 + 100, 
                    (currTime - time) / APPROACH_SECONDS * SCANLINE_Y - 25, 50, 50);
            }
        }

        ctx.fillStyle = 'rgb(0, 0, 255)';
        for(let note of this.beatmap.sliders) {
            if(note.hidden) continue;
            let time = <number>note.time;
            let buttonId = <number>note.buttonId;
            if(currTime > time && currTime < time + APPROACH_SECONDS + 1) {
                ctx.fillRect(buttonId * 200 + 100, 
                    (currTime - time) / APPROACH_SECONDS * SCANLINE_Y - 25, 50, 50);
            }
        }

        ctx.fillStyle = 'rgb(0, 0, 0)';
        for(let i = 0; i < 4; i++) {
            ctx.fillRect(i * 200 + 100 + 25, 0, 1, this.canvas.height);
        }

        for(let note of this.fadeOutNotes) {
            note.draw(currTime, ctx);
        }

        requestAnimationFrame(this.draw);
    }

    getNoteIdx(key: string) {
        switch(key) {
            case 'd': return 0;
            case 'f': return 1;
            case 'j': return 2;
            case 'k': return 3;
        }

        return -1;
    }

    handleKeyDown = (e: KeyboardEvent) => {
        const noteIdx = this.getNoteIdx(e.key);
        if(noteIdx === -1) return;

        this.heldKeys.add(noteIdx);

        const currTime = this.audioCtx.currentTime - <number>this.startTime;
        const notes = this.beatmap.notes;
        for(let i = 0; i < notes.length; i++) {
            let note = notes[i];
            if(note.buttonId === noteIdx && Math.abs(currTime - <number>note.time - APPROACH_SECONDS) < NOTE_LENIENCY) {
                note.hidden = true;
                this.scorer.increaseScore(100);
                this.fadeOutNotes.push(new FadeOutNote(currTime, currTime + 0.5, noteIdx));
                return;
            }
        }

        // no hit
        this.scorer.increaseScore(-100);
    }

    handleKeyUp = (e: KeyboardEvent) => {
        const noteIdx = this.getNoteIdx(e.key);
        if(noteIdx === -1) return;
        this.heldKeys.delete(noteIdx);
    }

}