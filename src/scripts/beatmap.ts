const HIT_CIRCLE = 0;
const SLIDER = 7;

const NOTE_Y = 192;

const DEFAULT_HIT_SOUND = 0;

const BEATMAP_HEADER = "osu file format v14";
//Using this temporarily so I dont have to figure it out right now
const TEMP_DATA = "Mode: 3\n\n[Editor]\n\n[Metadata]\nTitle:Song\nTitleUnicode:Song\nArtist:\nArtistUnicode:\nCreator:Andrew\nVersion:Andrew's Easy\nSource:\nTags:\nBeatmapID:1\nBeatmapSetID:1\n\n[Difficulty]\nHPDrainRate:6.5\nCircleSize:4\nOverallDifficulty:6.5\nApproachRate:5\nSliderMultiplier:1.4\nSliderTickRate:1\n\n[Events]\n\n[TimingPoints]\n//second number is bpm - 1 / value * 1000 * 60 = bpm, 333.33 = 180 bpm\n0,333.33,4,0,0,40,1,0";


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
    objectParams: String;
    hitSample: String;

    buttonId: number;
    // constructor(time: number, buttonId: number) {
    //   this.time = time;
    //   this.buttonId = buttonId;
    // }

    constructor(column: number, time: number, type: number) {
        //Defaults for osu mania
        this.y = NOTE_Y;
        this.hitSound = DEFAULT_HIT_SOUND;
        //hitSample: "";

        //Time input is in seconds, convert to ms here
        this.time = time * 1000;

    }

    toBytes() {
      const floatBuffer = new ArrayBuffer(8);
      const floatView = new Float64Array(floatBuffer);
      floatView[0] = this.time as number;
      const intBuffer = new ArrayBuffer(4);
      const intView = new Int32Array(intBuffer);
      intView[0] = this.buttonId as number;
      
      return [...Array.from(new Uint8Array(floatBuffer)), 
        ...Array.from(new Uint8Array(intBuffer))];
    }
}

class BeatMapData {
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

class BeatMap {
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
      
      const arrayBuffer = new ArrayBuffer(noteBytes.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < noteBytes.length; i++) {
        view[i] = noteBytes[i] as number;
      }
  
      const blob = new Blob([arrayBuffer], {type: 'application/octet-stream'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'beatmap.map';
      link.click();
    }
  }