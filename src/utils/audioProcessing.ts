import { NoiseReducer } from './noiseReducer';

export class AudioProcessor {
  private audioContext: AudioContext;
  private noiseReducer: NoiseReducer;

  constructor() {
    this.audioContext = new AudioContext();
    this.noiseReducer = new NoiseReducer(this.audioContext);
  }

  async trimSilence(audioBuffer: AudioBuffer, threshold = 0.01, minSilenceDuration = 0.25): Promise<AudioBuffer> {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const minSilenceSamples = minSilenceDuration * sampleRate;
    
    // Find start (non-silence)
    let startIndex = 0;
    for (let i = 0; i < channelData.length; i++) {
      if (Math.abs(channelData[i]) > threshold) {
        startIndex = Math.max(0, i - (sampleRate * 0.1)); // Keep 100ms before audio
        break;
      }
    }
    
    // Find end (non-silence)
    let endIndex = channelData.length - 1;
    for (let i = channelData.length - 1; i >= 0; i--) {
      if (Math.abs(channelData[i]) > threshold) {
        endIndex = Math.min(channelData.length, i + (sampleRate * 0.1)); // Keep 100ms after audio
        break;
      }
    }
    
    // Create new buffer with trimmed audio
    const trimmedBuffer = this.audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      endIndex - startIndex,
      sampleRate
    );
    
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const newChannelData = trimmedBuffer.getChannelData(channel);
      const originalChannelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < trimmedBuffer.length; i++) {
        newChannelData[i] = originalChannelData[startIndex + i];
      }
    }
    
    return trimmedBuffer;
  }

  async reduceNoise(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
    return this.noiseReducer.process(audioBuffer);
  }

  async blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    return this.audioContext.decodeAudioData(arrayBuffer);
  }

  async audioBufferToBlob(audioBuffer: AudioBuffer): Promise<Blob> {
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * channels;
    const wavData = new Float32Array(length);
    
    // Interleave channels
    for (let channel = 0; channel < channels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < audioBuffer.length; i++) {
        wavData[i * channels + channel] = channelData[i];
      }
    }
    
    // Create WAV file
    const wavBuffer = this.createWavFile(wavData, audioBuffer.sampleRate, channels);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  private createWavFile(samples: Float32Array, sampleRate: number, numChannels: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write audio data
    const volume = 0.8;
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample * 0x7FFF * volume, true);
      offset += 2;
    }

    return buffer;
  }
}