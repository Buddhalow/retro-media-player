class SPVisualizerElement extends HTMLElement {
  draw() {
    this.analyser.getByteTimeDomainData(dataArray);
    this.canvasCtx.fillStyle = "rgb(200 200 200)";
    this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = "rgb(0 0 0)";
    this.canvasCtx.beginPath();
    const sliceWidth = WIDTH / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * (HEIGHT / 2);
    
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
    
      x += sliceWidth;
    }
    this.canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    this.canvasCtx.stroke();
    const drawVisual = requestAnimationFrame(this.draw);
  }
  connectedCallback() {
    if (!this.created) {
      this.canvas = document.createElement('canvas')
      debugger
      this.appendChild(this.canvas);
      this.canvasCtx = this.canvas.getContext('2d')

      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();

      navigator.mediaDevices.getDisplayMedia({
        audio: true, video: true
      }).then((stream) => {
        debugger
        this.source = this.audioCtx.createMediaStreamSource(stream);
        this.analyser.fftSize = 2048;
        this.source.connect(this.analyzer);
        const bufferLength = analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        this.draw();
    
      }).catch((error) => {
        console.error(error)
        // Handle error
      }); 
      this.created = new Date();
    }
  }
}

export default SPVisualizerElement;
