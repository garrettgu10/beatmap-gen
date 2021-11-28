import Note from "./note";

export default class BeatMap {
    notes: Array<Note>;
    constructor() {
        this.notes = [];
    }

    addBeat(time: Number) {
        this.notes.push(new Note(time, Math.floor(Math.random() * 4)));
    }

    downloadFile() {
        const bytes: Array<Number> = [];
        this.notes.forEach(note => {
            bytes.push(...note.toBytes());
        });
        
        const arrayBuffer = new ArrayBuffer(bytes.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < bytes.length; i++) {
            view[i] = bytes[i] as number;
        }

        const blob = new Blob([arrayBuffer], {type: 'application/octet-stream'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'beatmap.map';
        link.click();
    }
}