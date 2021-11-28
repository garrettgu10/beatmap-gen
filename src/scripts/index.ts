import '../styles/index.scss';
import BeatMap from './beatmap';
import RhythmGame, {APPROACH_SECONDS} from './rhythmgame';
import Visualizer from './visualizer';

const stdev = require('standarddeviation');
const average = require('average');

const Uint8Array = window.Uint8Array;

if (process.env.NODE_ENV === 'development') {
  require('../index.html');
}

window.onload = function() {
  const audioFile = document.getElementById('audio-file');
  const visualizer = document.getElementById('visualizer') as HTMLCanvasElement;
  let audioContext = new AudioContext();
  let audioBeginTime = 0;
  audioFile.onchange = function() {
    const fileReader = new FileReader();
    const beatMap = new BeatMap();

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

        let eachFrame = () => {
          analyzer.getByteFrequencyData(dataArray);

          let diff = 0;

          for(let i = 0; i < frequencyBins; i++) {
            diff += Math.abs(dataArray[i] - previousDataArray[i]);
          }

          diffs.push(diff);
          const avg = average(diffs);
          const std = stdev.calculateStandardDeviation(diffs);

          const sensitivity = Number.parseFloat(
            (<HTMLInputElement>document.getElementById("sensitivity")).value);
          
          if(diff > avg + std * sensitivity) {
            if(!currentlyOnBeat) {
              const timestamp = audioContext.currentTime - audioBeginTime;
              beatMap.addBeat(timestamp);
            }
            currentlyOnBeat = true;
          }else{
            currentlyOnBeat = false;
          }

          let rollingDiffsSize = Number.parseInt(
            (<HTMLInputElement>document.getElementById("sustain")).value);

          while(diffs.length > rollingDiffsSize) {
            diffs.shift();
          }

          previousDataArray.set(dataArray);
        }

        setInterval(eachFrame, 30);

        source.connect(filter);

        const visualizerAnalyzer = audioContext.createAnalyser();
        visualizerAnalyzer.fftSize = 32;

        source
          .connect(new DelayNode(audioContext, {
            "delayTime": APPROACH_SECONDS
          }))
          .connect(visualizerAnalyzer)
          .connect(audioContext.destination);

        new Visualizer(<HTMLCanvasElement>document.getElementById("visualizer"), 
          visualizerAnalyzer);

        source.start();
        audioBeginTime = audioContext.currentTime;

        new RhythmGame(<HTMLCanvasElement>document.getElementById('game'), 
          beatMap, audioBeginTime, audioContext);

        source.addEventListener('ended', function() {
          beatMap.downloadFile();
        });
      });
    };
    
  };
};
