const HIT_CIRCLE = 1;
const SLIDER = 128;

const NOTE_Y = 192;

const DEFAULT_HIT_SOUND = 0;

const COLUMN_COUNT = 4;

const BEATMAP_HEADER = "osu file format v14";
//Using this temporarily so I dont have to figure it out right now
const TEMP_DATA = "Mode: 3\n\n[Editor]\n\n[Metadata]\nTitle:Song\nTitleUnicode:Song\nArtist:\nArtistUnicode:\nCreator:Andrew\nVersion:Andrew's Easy\nSource:\nTags:\nBeatmapID:1\nBeatmapSetID:1\n\n[Difficulty]\nHPDrainRate:6.5\nCircleSize:4\nOverallDifficulty:6.5\nApproachRate:5\nSliderMultiplier:1.4\nSliderTickRate:1\n\n[Events]\n\n[TimingPoints]\n//second number is bpm - 1 / value * 1000 * 60 = bpm, 333.33 = 180 bpm\n0,333.33,4,0,0,40,1,0";
const FILE_SIZE = 1;

// source: http://stackoverflow.com/a/11058858
function str2ab(str: string) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }


class Note {
    x: number;
    y: number;
    time: number;
    type: number;
    hitSound: number;
    objectParams: number;
    hitSample: String; //never used

    // constructor(time: number, buttonId: number) {
    //   this.time = time;
    //   this.buttonId = buttonId;
    // }

    constructor(time: number, column: number, type: number) {
        //Defaults for osu mania
        this.y = NOTE_Y;
        this.hitSound = DEFAULT_HIT_SOUND;
        this.type = type;

        //Formula converting column into x value on screen
        this.x = column * 512 / COLUMN_COUNT;
        //Time input is in seconds, convert to ms here
        this.time = Math.floor(time * 1000);

    }

    toBytes() {
        const xBuffer = new ArrayBuffer(4);
        const xView = new Int32Array(xBuffer);
        xView[0] = this.x as number;
        const yBuffer = new ArrayBuffer(4);
        const yView = new Int32Array(yBuffer);
        yView[0] = this.y as number;
        const timeBuffer = new ArrayBuffer(4);
        const timeView = new Int32Array(timeBuffer);
        timeView[0] = this.time as number;
        const typeBuffer = new ArrayBuffer(4);
        const typeView = new Int32Array(typeBuffer);
        typeView[0] = this.x as number;
        const hitSoundBuffer = new ArrayBuffer(4);
        const hitSoundView = new Int32Array(hitSoundBuffer);
        hitSoundView[0] = this.y as number;
        const objectParamsBuffer = new ArrayBuffer(4);
        const objectParamsView = new Int32Array(objectParamsBuffer);
        objectParamsView[0] = this.time as number;
      
      return [...Array.from(new Uint8Array(xBuffer)), 
        ...Array.from(new Uint8Array(yBuffer)), 
        ...Array.from(new Uint8Array(timeBuffer)), 
        ...Array.from(new Uint8Array(typeBuffer)), 
        ...Array.from(new Uint8Array(hitSoundBuffer)), 
        ...Array.from(new Uint8Array(objectParamsBuffer))];
    }
}

export class BeatMapData {
    AudioFilename: string;

    constructor(AudioFilename: string) {
        this.AudioFilename = AudioFilename;
    }

    toBytes() {
        var data = BEATMAP_HEADER.concat("\n\n[General]\nAudioFilename", this.AudioFilename, TEMP_DATA);
        const dataBuffer = str2ab(data);
        return Array.from(new Uint16Array(dataBuffer));
    }
}

export class BeatMap {
    data: BeatMapData;
    notes: Array<Note>;
    constructor() {
      this.notes = [];
    }

    setData(data: BeatMapData) {
        this.data = data;
    }
  
    addBeat(time: number) {
      this.notes.push(new Note(time, Math.floor(Math.random() * 4), HIT_CIRCLE));
    }
  
    downloadFile() {
      const noteBytes: Array<number> = [];
      this.notes.forEach(note => {
        noteBytes.push(...note.toBytes());
        });
        
        const dataBytes = this.data.toBytes();
        console.log("Creating File");
        console.log(noteBytes.length);
        console.log(dataBytes.length);
      const arrayBuffer = new ArrayBuffer(noteBytes.length + dataBytes.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < noteBytes.length; i++) {
        view[i] = noteBytes[i] as number;
      }
  
      const blob = new Blob([arrayBuffer], {type: 'application/octet-stream'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'beatmap.osu';
      link.click();
    }
  }