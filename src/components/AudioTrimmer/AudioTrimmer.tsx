import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';

interface AudioTrimmerProps {
  audioUrl: string;
  onSave: (trimmedBlob: Blob) => void;
  onCancel: () => void;
}

const AudioTrimmer: React.FC<AudioTrimmerProps> = ({ audioUrl, onSave, onCancel }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4F46E5',
        progressColor: '#818CF8',
        cursorColor: '#4F46E5',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 100,
        barGap: 3,
        plugins: [RegionsPlugin.create()]
      });

      wavesurfer.current.load(audioUrl);

      wavesurfer.current.on('ready', () => {
        const duration = wavesurfer.current!.getDuration();
        setDuration(duration);
        setEndTime(duration);

        // Create default region
        wavesurfer.current!.addRegion({
          start: 0,
          end: duration,
          color: 'rgba(79, 70, 229, 0.2)',
          drag: true,
          resize: true
        });
      });

      wavesurfer.current.on('region-updated', (region) => {
        setStartTime(region.start);
        setEndTime(region.end);
      });

      return () => {
        wavesurfer.current?.destroy();
      };
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrim = async () => {
    if (!wavesurfer.current) return;

    const audioContext = new AudioContext();
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Create new buffer for trimmed audio
    const trimmedLength = (endTime - startTime) * audioBuffer.sampleRate;
    const trimmedBuffer = new AudioBuffer({
      length: trimmedLength,
      numberOfChannels: audioBuffer.numberOfChannels,
      sampleRate: audioBuffer.sampleRate
    });

    // Copy the trimmed portion
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = new Float32Array(trimmedLength);
      audioBuffer.copyFromChannel(channelData, channel, startTime * audioBuffer.sampleRate);
      trimmedBuffer.copyToChannel(channelData, channel, 0);
    }

    // Convert to blob
    const offlineContext = new OfflineAudioContext(
      trimmedBuffer.numberOfChannels,
      trimmedBuffer.length,
      trimmedBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = trimmedBuffer;
    source.connect(offlineContext.destination);
    source.start();

    const renderedBuffer = await offlineContext.startRendering();
    const blob = await new Promise<Blob>((resolve) => {
      const mediaRecorder = new MediaRecorder(
        new MediaStream([new MediaStreamAudioSourceNode(audioContext, { buffer: renderedBuffer }).stream])
      );
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/webm' }));

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 100);
    });

    onSave(blob);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Trim Audio</h3>
        <p className="text-sm text-gray-600">
          Drag the edges of the highlighted region to trim your audio
        </p>
      </div>

      <div ref={waveformRef} className="mb-4" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">
          {formatTime(startTime)} / {formatTime(endTime)}
        </span>
        <span className="text-sm text-gray-600">
          Duration: {formatTime(endTime - startTime)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
        <div className="space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTrim}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Trim
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioTrimmer;
