import { useState, useRef, useEffect } from 'react';
import { uploadRecording } from '../utils/supabaseStorage';
import { AudioProcessor } from '../utils/audioProcessing';
import { playStartSound, playStopSound, playPauseSound, playResumeSound } from '../utils/sounds';

interface UseAudioRecorderProps {
  userId: string | undefined;
  deviceId?: string;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  audioURL: string | null;
  duration: number;
  isSaving: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  saveRecording: (name: string) => Promise<void>;
  deleteRecording: () => void;
  downloadRecording: () => void;
  trimSilence: () => Promise<void>;
  trimAudio: (startTime: number, endTime: number) => Promise<void>;
  lastSavedUrl: string | null;
}

export const useAudioRecorder = ({ userId, deviceId }: UseAudioRecorderProps): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSavedUrl, setLastSavedUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioProcessorRef = useRef<AudioProcessor>(new AudioProcessor());
  const currentBlobRef = useRef<Blob | null>(null);

  const resetRecordingState = () => {
    setDuration(0);
    setIsRecording(false);
    setIsPaused(false);
    setAudioURL(null);
    currentBlobRef.current = null;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    // Stop recording when duration reaches 120 seconds (2 minutes)
    if (duration >= 120 && isRecording) {
      stopRecording();
      alert('Recording stopped: Maximum duration of 2 minutes reached');
    }
  }, [duration]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      
      // Reset duration when starting new recording
      setDuration(0);
      
      // Setup audio chunks collection
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        currentBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Clear timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };

      // Start recording
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      playStartSound(); // Play start sound

      // Start duration timer
      timerIntervalRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      playStopSound(); // Play stop sound
      
      // Clear timers
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      playPauseSound(); // Play pause sound
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      playResumeSound(); // Play resume sound
      timerIntervalRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const saveRecording = async (name: string) => {
    if (!audioURL || !userId) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(audioURL);
      const blob = await response.blob();
      await uploadRecording(blob, userId, name);
      
      // Reset recording state
      resetRecordingState();
    } catch (error) {
      console.error('Error saving recording:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    resetRecordingState();
    setLastSavedUrl(null);
  };

  const downloadRecording = () => {
    if (audioURL) {
      const a = document.createElement('a');
      a.href = audioURL;
      a.download = `recording-${new Date().toISOString()}.wav`;
      a.click();
    }
  };

  const updateAudioWithProcessedBlob = async (processedBlob: Blob) => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    currentBlobRef.current = processedBlob;
    const newUrl = URL.createObjectURL(processedBlob);
    setAudioURL(newUrl);
  };

  const trimSilence = async () => {
    if (!currentBlobRef.current) return;

    setIsProcessing(true);
    try {
      const audioBuffer = await audioProcessorRef.current.blobToAudioBuffer(currentBlobRef.current);
      const trimmedBuffer = await audioProcessorRef.current.trimSilence(audioBuffer);
      const trimmedBlob = await audioProcessorRef.current.audioBufferToBlob(trimmedBuffer);
      await updateAudioWithProcessedBlob(trimmedBlob);
    } catch (error) {
      console.error('Error trimming silence:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const trimAudio = async (startTime: number, endTime: number) => {
    if (!currentBlobRef.current) return;
    
    setIsProcessing(true);
    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await currentBlobRef.current.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Calculate the number of samples for the trimmed section
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const trimmedLength = endSample - startSample;
      
      // Create a new buffer for the trimmed audio
      const trimmedBuffer = new AudioBuffer({
        length: trimmedLength,
        numberOfChannels: audioBuffer.numberOfChannels,
        sampleRate: sampleRate
      });
      
      // Copy the trimmed portion for each channel
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = new Float32Array(trimmedLength);
        audioBuffer.copyFromChannel(channelData, channel, startSample);
        trimmedBuffer.copyToChannel(channelData, channel, 0);
      }
      
      // Convert trimmed buffer to blob
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      const source = audioContext.createBufferSource();
      source.buffer = trimmedBuffer;
      source.connect(mediaStreamDestination);
      source.start();
      
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const newBlob = new Blob(chunks, { type: 'audio/wav' });
        currentBlobRef.current = newBlob;
        const url = URL.createObjectURL(newBlob);
        setAudioURL(url);
        setIsProcessing(false);
      };
      
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), (endTime - startTime) * 1000 + 100);
      
    } catch (error) {
      console.error('Error trimming audio:', error);
      setIsProcessing(false);
    }
  };

  return {
    isRecording,
    isPaused,
    audioURL,
    duration,
    isSaving,
    isProcessing,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    saveRecording,
    deleteRecording,
    downloadRecording,
    trimSilence,
    trimAudio,
    lastSavedUrl
  };
};