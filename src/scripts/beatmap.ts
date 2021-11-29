import Note from "./note";

const BEATMAP_HEADER = "osu file format v14\n\n[General]\nAudioFilename: ";
//The rest of the file data is stored here temporarily, will make customizable at a later date
const TEMP_DATA = "\nMode: 3\n\n[Editor]\n\n[Metadata]\nTitle:Song\nTitleUnicode:Song\nArtist:\nArtistUnicode:\nCreator:Andrew\nVersion:Andrew's Easy\nSource:\nTags:\nBeatmapID:1\nBeatmapSetID:1\n\n[Difficulty]\nHPDrainRate:6.5\nCircleSize:4\nOverallDifficulty:6.5\nApproachRate:5\nSliderMultiplier:1.4\nSliderTickRate:1\n\n[Events]\n\n[TimingPoints]\n//second number is bpm - 1 / value * 1000 * 60 = bpm, 333.33 = 180 bpm\n0,333.33,4,0,0,40,1,0\n\n[HitObjects]\n";

export default class BeatMap {
    notes: Array<Note>;
    sliders: Array<Note>;
    filename: string;

    activeSlider: number = -1;
    sliderStartTime: number;
    sliderSongStartTime: number;
    constructor(filename: string) {
        this.notes = [];
        this.sliders = [];
        this.filename = filename;
        setInterval(() => {
          if(this.activeSlider != -1) {
            this.sliders.push(new Note(this.sliderSongStartTime + (performance.now() - this.sliderStartTime)/1000, 
              this.activeSlider));
              console.log("add new slider");
          }
        }, 50);
    }

    addBeat(time: number) {
      let buttonId = Math.floor(Math.random() * 4);
      while(buttonId == this.activeSlider) {
        buttonId = Math.floor(Math.random() * 4);
      }
      this.notes.push(new Note(time, buttonId));
    }

    beginSlider(time: number) {
      console.log("Begin");
      this.sliderSongStartTime = time;
      this.sliderStartTime = performance.now();
      this.activeSlider = Math.floor(Math.random() * 4);
    }

    endSlider() {
      console.log("End");
      this.activeSlider = -1;
    }

    sliderIsActive() : boolean {
      return this.activeSlider != -1;
    }

    downloadUTCTFFile() {
        const bytes: Array<number> = [];
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

    downloadFile() {
        var notestr = "";
        this.notes.forEach(note => {
          notestr += note.toString();
        });
    
        const blob = new Blob([BEATMAP_HEADER, this.filename, TEMP_DATA, notestr], {type: 'application/octet-stream'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'beatmap.osu';
        link.click();
      }
}