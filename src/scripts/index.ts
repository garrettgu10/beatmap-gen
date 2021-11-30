import '../styles/index.scss';
import BeatMap from './beatmap';
import RhythmGame, {APPROACH_SECONDS} from './rhythmgame';
import Visualizer from './visualizer';
import Wavifier from './wavifier';

const stdev = require('standarddeviation');
const average = require('average');

const Uint8Array = window.Uint8Array;

if (process.env.NODE_ENV === 'development') {
  require('../index.html');
}

window.onload = function() {
  const audioFile = document.getElementById('audio-file') as HTMLInputElement;
  const osuDownloadButton = document.getElementById('osu_download') as HTMLButtonElement;
  const utctfDownloadButton = document.getElementById('utctf_download') as HTMLButtonElement;
  osuDownloadButton.style.display = "none";
  utctfDownloadButton.style.display = "none";
  let audioContext = new AudioContext();
  let audioBeginTime = 0;
  let sliderStreak = 10;
  audioFile.onchange = function() {
    audioFile.style.display = "none";
    const fileReader = new FileReader();
    const beatMap = new BeatMap((<HTMLInputElement>this).files[0].name);

    osuDownloadButton.onclick = () => {
      beatMap.downloadFile();
    };
    utctfDownloadButton.onclick = () => {
      beatMap.downloadUTCTFFile();
    }

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

          let sliderShouldBeActive = false;
          const sliderThreshold = Number.parseInt((document.getElementById('slider_threshold') as HTMLInputElement).value);
          const sliderStickiness = Number.parseInt((document.getElementById('slider_stickiness') as HTMLInputElement).value);
          const timestamp = audioContext.currentTime - audioBeginTime;

          for(let i = 0; i < frequencyBins; i++) {
            diff += Math.abs(dataArray[i] - previousDataArray[i]);

            if(dataArray[i] > sliderThreshold) {
              sliderShouldBeActive = true;
            }
          }

          if(!beatMap.sliderIsActive() && sliderShouldBeActive) {
            sliderStreak++;
            if(sliderStreak >= sliderStickiness) {
              beatMap.beginSlider(timestamp);
              sliderStreak = 0;
            }
          }
          if(beatMap.sliderIsActive() && !sliderShouldBeActive) {
            sliderStreak++;
            if(sliderStreak >= sliderStickiness) {
              beatMap.endSlider();
              sliderStreak = 0;
            }
          }

          diffs.push(diff);
          const avg = average(diffs);
          const std = stdev.calculateStandardDeviation(diffs);

          const sensitivity = 2-Number.parseFloat(
            (<HTMLInputElement>document.getElementById("sensitivity")).value);
          
          if(diff > avg + std * sensitivity) {
            if(!currentlyOnBeat) {
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
        new Wavifier(<HTMLCanvasElement>document.getElementById("visualizer"));

        source.start();
        audioBeginTime = audioContext.currentTime;

        new RhythmGame(<HTMLCanvasElement>document.getElementById('game'), 
          beatMap, audioBeginTime, audioContext);

        source.addEventListener('ended', function() {
          osuDownloadButton.style.display = "inline";
          utctfDownloadButton.style.display = "inline";
          console.log('done');
        });
      });
    };
    
  };
};
