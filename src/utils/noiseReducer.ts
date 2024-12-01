export class NoiseReducer {
    private context: AudioContext;
    private fftSize: number = 2048;
  
    constructor(context: AudioContext) {
      this.context = context;
    }
  
    async process(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
      const channels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length;
      const sampleRate = audioBuffer.sampleRate;
      
      // Create output buffer
      const outputBuffer = this.context.createBuffer(channels, length, sampleRate);
      
      for (let channel = 0; channel < channels; channel++) {
        const inputData = audioBuffer.getChannelData(channel);
        const outputData = outputBuffer.getChannelData(channel);
        
        // Process in chunks
        const chunkSize = this.fftSize;
        for (let i = 0; i < length; i += chunkSize) {
          const chunk = inputData.slice(i, i + chunkSize);
          const processedChunk = await this.processChunk(chunk);
          
          // Copy processed data back
          for (let j = 0; j < processedChunk.length && (i + j) < length; j++) {
            outputData[i + j] = processedChunk[j];
          }
        }
      }
      
      return outputBuffer;
    }
  
    private async processChunk(chunk: Float32Array): Promise<Float32Array> {
      // Create offline context for processing
      const offlineCtx = new OfflineAudioContext(1, chunk.length, this.context.sampleRate);
      
      // Create buffer with chunk data
      const buffer = offlineCtx.createBuffer(1, chunk.length, offlineCtx.sampleRate);
      buffer.getChannelData(0).set(chunk);
      
      // Create source
      const source = offlineCtx.createBufferSource();
      source.buffer = buffer;
      
      // Create filters
      const lowpass = offlineCtx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 2000;
      lowpass.Q.value = 0.5;
      
      const highpass = offlineCtx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 150;
      highpass.Q.value = 0.5;
      
      // Connect nodes
      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(offlineCtx.destination);
      
      // Start source
      source.start();
      
      // Render and return processed chunk
      const renderedBuffer = await offlineCtx.startRendering();
      return renderedBuffer.getChannelData(0);
    }
  }