!function(){"use strict";var e,t={998:function(e,t,n){var r=function(e,t,n){if(n||2===arguments.length)for(var r,i=0,a=t.length;i<a;i++)!r&&i in t||(r||(r=Array.prototype.slice.call(t,0,i)),r[i]=t[i]);return e.concat(r||Array.prototype.slice.call(t))},i=function(){function e(e,t){this.hidden=!1,this.time=e,this.buttonId=t}return e.prototype.toBytes=function(){var e=new ArrayBuffer(8);new Float64Array(e)[0]=this.time;var t=new ArrayBuffer(4);return new Int32Array(t)[0]=this.buttonId,r(r([],Array.from(new Uint8Array(e)),!0),Array.from(new Uint8Array(t)),!0)},e.prototype.toString=function(){return 512*this.buttonId/4+",192,"+Math.floor(1e3*this.time)+",1,0,"+"0:0:0:0:\n"},e}(),a=function(){function e(e){var t=this;this.activeSlider=-1,this.notes=[],this.sliders=[],this.filename=e,setInterval((function(){-1!=t.activeSlider&&(t.sliders.push(new i(t.sliderSongStartTime+(performance.now()-t.sliderStartTime)/1e3,t.activeSlider)),console.log("add new slider"))}),50)}return e.prototype.addBeat=function(e){for(var t=Math.floor(4*Math.random());t==this.activeSlider;)t=Math.floor(4*Math.random());this.notes.push(new i(e,t))},e.prototype.beginSlider=function(e){console.log("Begin"),this.sliderSongStartTime=e,this.sliderStartTime=performance.now(),this.activeSlider=Math.floor(4*Math.random())},e.prototype.endSlider=function(){console.log("End"),this.activeSlider=-1},e.prototype.sliderIsActive=function(){return-1!=this.activeSlider},e.prototype.downloadUTCTFFile=function(){var e=[];this.notes.forEach((function(t){e.push.apply(e,t.toBytes())}));for(var t=new ArrayBuffer(e.length),n=new Uint8Array(t),r=0;r<e.length;r++)n[r]=e[r];var i=new Blob([t],{type:"application/octet-stream"}),a=document.createElement("a");a.href=URL.createObjectURL(i),a.download="beatmap.map",a.click()},e.prototype.downloadFile=function(){var e="";this.notes.forEach((function(t){e+=t.toString()}));var t=new Blob(["osu file format v14\n\n[General]\nAudioFilename: ",this.filename,"\nMode: 3\n\n[Editor]\n\n[Metadata]\nTitle:Song\nTitleUnicode:Song\nArtist:\nArtistUnicode:\nCreator:Andrew\nVersion:Andrew's Easy\nSource:\nTags:\nBeatmapID:1\nBeatmapSetID:1\n\n[Difficulty]\nHPDrainRate:6.5\nCircleSize:4\nOverallDifficulty:6.5\nApproachRate:5\nSliderMultiplier:1.4\nSliderTickRate:1\n\n[Events]\n\n[TimingPoints]\n//second number is bpm - 1 / value * 1000 * 60 = bpm, 333.33 = 180 bpm\n0,333.33,4,0,0,40,1,0\n\n[HitObjects]\n",e],{type:"application/octet-stream"}),n=document.createElement("a");n.href=URL.createObjectURL(t),n.download="beatmap.osu",n.click()},e}(),o=500,s=function(){function e(){this.currScore=0}return e.prototype.increaseScore=function(e){this.currScore+=e,document.getElementById("score").innerHTML=this.currScore.toString()},e}(),c=function(){function e(e,t,n,r){void 0===r&&(r="255, 0, 0"),this.startTime=e,this.endTime=t,this.noteIdx=n,this.color=r}return e.prototype.draw=function(e,t){var n=1-(e-this.startTime)/(this.endTime-this.startTime);t.fillStyle="rgba(".concat(this.color,", ").concat(n,")");var r=50+50*(1-n);t.fillRect(200*this.noteIdx+125-r/2,o-r/2,r,r)},e}(),l=function(){function e(e,t,n,r){var i=this;this.fadeOutNotes=[],this.scorer=new s,this.heldKeys=new Set,this.handleSliders=function(){for(var e=i.audioCtx.currentTime-i.startTime,t=0,n=i.beatmap.sliders;t<n.length;t++){var r=n[t];Math.abs(e-r.time-1)<.03&&i.heldKeys.has(r.buttonId)&&(i.scorer.increaseScore(10),i.fadeOutNotes.push(new c(e,e+.2,r.buttonId,"0, 0, 255")),r.hidden=!0)}requestAnimationFrame(i.handleSliders)},this.cleanUp=function(){i.beatmap.sliders=i.beatmap.sliders.filter((function(e){return!e.hidden}));var e=i.audioCtx.currentTime-i.startTime;i.fadeOutNotes.filter((function(t){return t.endTime<e})),i.beatmap.sliders=i.beatmap.sliders.filter((function(t){return e<t.time+1+1}))},this.draw=function(){var e=i.canvas.getContext("2d"),t=i.audioCtx.currentTime-i.startTime;e.clearRect(0,0,i.canvas.width,i.canvas.height),e.fillStyle="rgb(255, 0, 0)",e.fillRect(0,o,i.canvas.width,1);for(var n=0,r=i.beatmap.notes;n<r.length;n++)if(!(f=r[n]).hidden){var a=f.time,s=f.buttonId;t>a&&t<a+1+1&&e.fillRect(200*s+100,(t-a)/1*o-25,50,50)}e.fillStyle="rgb(0, 0, 255)";for(var c=0,l=i.beatmap.sliders;c<l.length;c++)(f=l[c]).hidden||(a=f.time,s=f.buttonId,t>a&&t<a+1+1&&e.fillRect(200*s+100,(t-a)/1*o-25,50,50));e.fillStyle="rgb(0, 0, 0)";for(var d=0;d<4;d++)e.fillRect(200*d+100+25,0,1,i.canvas.height);for(var u=0,h=i.fadeOutNotes;u<h.length;u++){var f;(f=h[u]).draw(t,e)}requestAnimationFrame(i.draw)},this.handleKeyDown=function(e){var t=i.getNoteIdx(e.key);if(-1!==t){i.heldKeys.add(t);for(var n=i.audioCtx.currentTime-i.startTime,r=i.beatmap.notes,a=0;a<r.length;a++){var o=r[a];if(!o.hidden&&o.buttonId===t&&Math.abs(n-o.time-1)<.3)return o.hidden=!0,i.scorer.increaseScore(100),void i.fadeOutNotes.push(new c(n,n+.2,t))}i.scorer.increaseScore(-100)}},this.handleKeyUp=function(e){var t=i.getNoteIdx(e.key);-1!==t&&i.heldKeys.delete(t)},this.canvas=e,this.beatmap=t,this.startTime=n,this.audioCtx=r,document.addEventListener("keydown",this.handleKeyDown),document.addEventListener("keyup",this.handleKeyUp),requestAnimationFrame(this.handleSliders),requestAnimationFrame(this.draw),setInterval(this.cleanUp,100)}return e.prototype.getNoteIdx=function(e){switch(e){case"d":return 0;case"f":return 1;case"j":return 2;case"k":return 3}return-1},e}(),d=window.Uint8Array,u=function(){function e(e,t,n,r,i){this.x=e,this.y=t,this.radius=n,this.color=r,this.direction=i}return e.prototype.draw=function(e){e.beginPath(),e.arc(this.x,this.y,this.radius,0,2*Math.PI),e.fillStyle=this.color,e.fill()},e.prototype.move=function(e){this.x+=Math.cos(this.direction)*e,this.y+=Math.sin(this.direction)*e,this.x<0?this.x=800:this.x>800&&(this.x=0),this.y<0?this.y=600:this.y>600&&(this.y=0)},e}(),h=function(e,t){var n=this;this.draw=function(){var e=new d(n.analyzer.frequencyBinCount);n.analyzer.getByteFrequencyData(e);var t=n.canvas.getContext("2d");t.clearRect(0,0,n.canvas.width,n.canvas.height),t.fillStyle="rgba(200, 200, 200, 50)";for(var r=n.canvas.width/n.analyzer.frequencyBinCount,i=0;i<n.analyzer.frequencyBinCount;i++)t.fillRect(i*r,0,r,n.canvas.height-e[i]/256*n.canvas.height);n.balls.forEach((function(n,r){n.move(e[r]/255*3),n.radius=e[r]/255*150,n.draw(t)})),requestAnimationFrame(n.draw)},this.canvas=e,this.analyzer=t,this.balls=[];for(var r=0;r<this.analyzer.frequencyBinCount;r++)this.balls[r]=new u(800*Math.random(),600*Math.random(),10,"#"+Math.floor(16777215*Math.random()).toString(16),2*Math.random()*Math.PI);requestAnimationFrame(this.draw)},f=n(982),m=function(e){var t=this;this.draw=function(){t.texture.loadContentsOf(t.src),t.glcanvas.draw(t.texture).swirl(t.src.width/2,t.src.height/2,t.src.width,2*Math.sin(performance.now()/400)).update(),requestAnimationFrame(t.draw)},this.src=e,this.glcanvas=f.canvas(),this.srcCtx=this.src.getContext("2d"),this.texture=this.glcanvas.texture(e),this.src.parentNode.insertBefore(this.glcanvas,this.src),this.src.style.display="none",this.glcanvas.className=this.src.className+" transparent",requestAnimationFrame(this.draw)},y=n(559),v=n(656),p=window.Uint8Array;window.onload=function(){var e=document.getElementById("audio-file"),t=document.getElementById("osu_download"),n=document.getElementById("utctf_download");t.style.display="none",n.style.display="none";var r=new AudioContext,i=0,o=10;e.onchange=function(){e.style.display="none";var s=new FileReader,c=new a(this.files[0].name);t.onclick=function(){c.downloadFile()},n.onclick=function(){c.downloadUTCTFFile()},s.readAsArrayBuffer(this.files[0]),s.onload=function(){var e=this.result;r.decodeAudioData(e,(function(e){var a=r.createBufferSource();a.buffer=e;var s=new BiquadFilterNode(r,{type:"lowpass",frequency:100}),d=r.createAnalyser();s.connect(d),d.fftSize=2048;var u=d.frequencyBinCount,f=new p(u),w=new p(u),g=[],b=!1;setInterval((function(){d.getByteFrequencyData(f);for(var e=0,t=!1,n=Number.parseInt(document.getElementById("slider_threshold").value),a=Number.parseInt(document.getElementById("slider_stickiness").value),s=r.currentTime-i,l=0;l<64;l++)e+=Math.abs(f[l]-w[l]),f[l]>n&&(t=!0);!c.sliderIsActive()&&t&&++o>=a&&(c.beginSlider(s),o=0),c.sliderIsActive()&&!t&&++o>=a&&(c.endSlider(),o=0),g.push(e),e>v(g)+y.calculateStandardDeviation(g)*(2-Number.parseFloat(document.getElementById("sensitivity").value))?(b||c.addBeat(s),b=!0):b=!1;for(var u=Number.parseInt(document.getElementById("sustain").value);g.length>u;)g.shift();w.set(f)}),30),a.connect(s);var S=r.createAnalyser();S.fftSize=32,a.connect(new DelayNode(r,{delayTime:1})).connect(S).connect(r.destination),new h(document.getElementById("visualizer"),S),new m(document.getElementById("visualizer")),a.start(),i=r.currentTime,new l(document.getElementById("game"),c,i,r),a.addEventListener("ended",(function(){t.style.display="inline",n.style.display="inline",console.log("done")}))}))}}}}},n={};function r(e){var i=n[e];if(void 0!==i)return i.exports;var a=n[e]={exports:{}};return t[e](a,a.exports,r),a.exports}r.m=t,e=[],r.O=function(t,n,i,a){if(!n){var o=1/0;for(d=0;d<e.length;d++){n=e[d][0],i=e[d][1],a=e[d][2];for(var s=!0,c=0;c<n.length;c++)(!1&a||o>=a)&&Object.keys(r.O).every((function(e){return r.O[e](n[c])}))?n.splice(c--,1):(s=!1,a<o&&(o=a));if(s){e.splice(d--,1);var l=i();void 0!==l&&(t=l)}}return t}a=a||0;for(var d=e.length;d>0&&e[d-1][2]>a;d--)e[d]=e[d-1];e[d]=[n,i,a]},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},function(){var e={143:0};r.O.j=function(t){return 0===e[t]};var t=function(t,n){var i,a,o=n[0],s=n[1],c=n[2],l=0;for(i in s)r.o(s,i)&&(r.m[i]=s[i]);if(c)var d=c(r);for(t&&t(n);l<o.length;l++)a=o[l],r.o(e,a)&&e[a]&&e[a][0](),e[o[l]]=0;return r.O(d)},n=self.webpackChunkwebpack_starter=self.webpackChunkwebpack_starter||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))}();var i=r.O(void 0,[122],(function(){return r(998)}));i=r.O(i)}();
//# sourceMappingURL=app.26f90dd5.js.map