import '../styles/index.scss';

const stdev = require('standarddeviation');
const average = require('average');

const Uint8Array = window.Uint8Array;


const HIT_CIRCLE = 1;
const SLIDER = 128;

const NOTE_Y = 192;

const DEFAULT_HIT_SOUND = 0;

const COLUMN_COUNT = 4;

const BEATMAP_HEADER = "osu file format v14";
//Using this temporarily so I dont have to figure it out right now
const TEMP_DATA = "Mode: 3\n\n[Editor]\n\n[Metadata]\nTitle:Song\nTitleUnicode:Song\nArtist:\nArtistUnicode:\nCreator:Andrew\nVersion:Andrew's Easy\nSource:\nTags:\nBeatmapID:1\nBeatmapSetID:1\n\n[Difficulty]\nHPDrainRate:6.5\nCircleSize:4\nOverallDifficulty:6.5\nApproachRate:5\nSliderMultiplier:1.4\nSliderTickRate:1\n\n[Events]\n\n[TimingPoints]\n//second number is bpm - 1 / value * 1000 * 60 = bpm, 333.33 = 180 bpm\n0,333.33,4,0,0,40,1,0\n\n[HitObjects]\n";


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
        this.objectParams = 0;
        this.hitSample = "0:0:0:0:";
    }

    //unused
    // toBytes() {
    //   const floatBuffer = new ArrayBuffer(8);
    //   const floatView = new Float64Array(floatBuffer);
    //   floatView[0] = this.time as number;
    //   const intBuffer = new ArrayBuffer(4);
    //   const intView = new Int32Array(intBuffer);
    //   intView[0] = this.x as number;
      
    //   return [...Array.from(new Uint8Array(floatBuffer)), 
    //     ...Array.from(new Uint8Array(intBuffer))];
    // }

    //returns note as string
    getNote()
    {
      var str: string;
      str = "" + this.x + "," + this.y + "," + this.time + "," + this.type + "," + this.hitSound + ",";
      if(this.objectParams != 0)
      {
        str += this.objectParams + ":";
      }
      str += this.hitSample + "\n";
      return str;
    }
}

class BeatMapData {
    AudioFilename: string;

    constructor(AudioFilename: string) {
        this.AudioFilename = AudioFilename;
    }

    getData() {
        var data = BEATMAP_HEADER.concat("\n\n[General]\nAudioFilename: ", this.AudioFilename, "\n", TEMP_DATA);
        return data;
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
      var notestr = "";
      this.notes.forEach(note => {
        notestr += note.getNote();
      });
      
      // const arrayBuffer = new ArrayBuffer(notes.length);
      // const view = new Uint16Array(arrayBuffer);
      // for (let i = 0; i < notes.length; i++) {
      //   view[i] = notes[i] as string;
      // }
  
      const blob = new Blob([this.data.getData(), notestr], {type: 'application/octet-stream'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'beatmap.osu';
      link.click();
    }
  }


if (process.env.NODE_ENV === 'development') {
  require('../index.html');
}

const ROLLING_DIFFS_SIZE = 100;

window.onload = function() {
  const audioFile = document.getElementById('audio-file');
  const audioFilename = audioFile.nodeValue;
  const visualizer = document.getElementById('visualizer') as HTMLCanvasElement;
  let audioContext = new AudioContext();
  let audioBeginTime = 0;
  const beatMap = new BeatMap();
  const beatMapData = new BeatMapData(audioFilename);
  beatMap.setData(beatMapData);
  audioFile.onchange = function() {
    const fileReader = new FileReader();

    fileReader.readAsArrayBuffer((<HTMLInputElement>this).files[0]);

    fileReader.onload = function() {
      const arrayBuffer = this.result as ArrayBuffer;
      audioContext.decodeAudioData(arrayBuffer, function(buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        const filter = new BiquadFilterNode(audioContext, {
          type: 'lowpass',
          frequency: 100,
        });

        const analyzer = audioContext.createAnalyser();
        filter.connect(analyzer);
        
        analyzer.fftSize = 2048;
        const bufferLength = analyzer.frequencyBinCount;
        const frequencyBins = 64; // we care about the lowermost frequency bins
        let dataArray = new Uint8Array(bufferLength);
        let previousDataArray = new Uint8Array(bufferLength);

        let diffs: Array<Number> = [];
        let currentlyOnBeat = false;

        setInterval(() => {
          analyzer.getByteFrequencyData(dataArray);
          const visualizerCtx = visualizer.getContext('2d');
          visualizerCtx.clearRect(0, 0, visualizer.width, visualizer.height);
          
          visualizerCtx.fillStyle = 'rgb(0, 0, 0)';

          const barWidth = visualizer.width / frequencyBins;
          
          for(let i = 0; i < frequencyBins; i++) {
            visualizerCtx.fillRect(i * barWidth, 0, barWidth, visualizer.height - dataArray[i] / 256 * visualizer.height);
          }

          let diff = 0;

          for(let i = 0; i < frequencyBins; i++) {
            diff += Math.abs(dataArray[i] - previousDataArray[i]);
          }
          
          visualizerCtx.fillStyle = 'rgb(255, 0, 0)';
          visualizerCtx.fillRect(0, visualizer.height - 10, diff / 10, 10);

          diffs.push(diff);
          const avg = average(diffs);
          const std = stdev.calculateStandardDeviation(diffs);
          
          if(diff > avg + std) {
            if(!currentlyOnBeat) {
              const timestamp = audioContext.currentTime - audioBeginTime;
              console.log(timestamp);
              beatMap.addBeat(timestamp);
              visualizerCtx.fillRect(0, 0, 10, 10);
            }
            currentlyOnBeat = true;
          }else{
            currentlyOnBeat = false;
          }

          if(diffs.length > ROLLING_DIFFS_SIZE) {
            diffs.shift();
          }

          previousDataArray.set(dataArray);
        }, 30);

        source.connect(filter).connect(audioContext.destination);
        source.start();
        audioBeginTime = audioContext.currentTime;

        source.addEventListener('ended', function() {
          beatMap.downloadFile();
        });
      });
    };
    
  };
};
