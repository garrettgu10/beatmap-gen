import '../styles/index.scss';

const stdev = require('standarddeviation');
const average = require('average');

const Uint8Array = window.Uint8Array;

if (process.env.NODE_ENV === 'development') {
  require('../index.html');
}

const ROLLING_DIFFS_SIZE = 100;

class Note {
  time: Number;
  buttonId: Number;
  constructor(time: Number, buttonId: Number) {
    this.time = time;
    this.buttonId = buttonId;
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

class BeatMap {
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

window.onload = function() {
  const audioFile = document.getElementById('audio-file');
  const visualizer = document.getElementById('visualizer') as HTMLCanvasElement;
  let audioContext = new AudioContext();
  let audioBeginTime = 0;
  const beatMap = new BeatMap();
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
