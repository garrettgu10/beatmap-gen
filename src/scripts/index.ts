import '../styles/index.scss';
import BeatMap from './beatmap';
import RhythmGame, {APPROACH_SECONDS} from './rhythmgame';

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

        let eachFrame = () => {
          analyzer.getByteFrequencyData(dataArray);
          // const visualizerCtx = visualizer.getContext('2d');
          // visualizerCtx.clearRect(0, 0, visualizer.width, visualizer.height);
          
          // visualizerCtx.fillStyle = 'rgb(0, 0, 0)';

          // const barWidth = visualizer.width / frequencyBins;
          
          // for(let i = 0; i < frequencyBins; i++) {
          //   visualizerCtx.fillRect(i * barWidth, 0, barWidth, visualizer.height - dataArray[i] / 256 * visualizer.height);
          // }

          let diff = 0;

          for(let i = 0; i < frequencyBins; i++) {
            diff += Math.abs(dataArray[i] - previousDataArray[i]);
          }
          
          // visualizerCtx.fillStyle = 'rgb(255, 0, 0)';
          // visualizerCtx.fillRect(0, visualizer.height - 10, diff / 10, 10);

          diffs.push(diff);
          const avg = average(diffs);
          const std = stdev.calculateStandardDeviation(diffs);

          const sensitivity = Number.parseFloat(
            (<HTMLInputElement>document.getElementById("sensitivity")).value);
          
          if(diff > avg + std * sensitivity) {
            if(!currentlyOnBeat) {
              const timestamp = audioContext.currentTime - audioBeginTime;
              beatMap.addBeat(timestamp);
              // visualizerCtx.fillRect(0, 0, 10, 10);
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

        source
          .connect(new DelayNode(audioContext, {
            "delayTime": APPROACH_SECONDS
          }))
          .connect(audioContext.destination);

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
