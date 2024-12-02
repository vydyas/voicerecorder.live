import { useState, useRef, useEffect } from 'react';
import { uploadRecording } from '../utils/supabaseStorage';
import { AudioProcessor } from '../utils/audioProcessing';

interface UseAudioRecorderProps {
  userId?: string;
  deviceId?: string;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  audioURL: string | null;
  duration: number;
  isSaving: boolean;
  isProcessing: boolean;
  lastSavedUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  downloadRecording: () => void;
  saveRecording: (name: string) => Promise<void>;
  deleteRecording: () => void;
  trimSilence: () => Promise<void>;
  reduceNoise: () => Promise<void>;
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
      
      // Clear timers
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const saveRecording = async (name: string) => {
    if (!audioURL || !userId) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(audioURL);
      const blob = await response.blob();
      await uploadRecording(blob, userId, name);
      setAudioURL(null);
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
    setAudioURL(null);
    currentBlobRef.current = null;
    setLastSavedUrl(null);
    setDuration(0); // Reset the duration when deleting the recording
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
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
      const processedBlob = await audioProcessorRef.current.audioBufferToBlob(trimmedBuffer);
      await updateAudioWithProcessedBlob(processedBlob);
    } catch (error) {
      console.error('Error trimming silence:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const reduceNoise = async () => {
    if (!currentBlobRef.current) return;

    setIsProcessing(true);
    try {
      const audioBuffer = await audioProcessorRef.current.blobToAudioBuffer(currentBlobRef.current);
      const processedBuffer = await audioProcessorRef.current.reduceNoise(audioBuffer);
      const processedBlob = await audioProcessorRef.current.audioBufferToBlob(processedBuffer);
      await updateAudioWithProcessedBlob(processedBlob);
    } catch (error) {
      console.error('Error reducing noise:', error);
    } finally {
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
    lastSavedUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    saveRecording,
    deleteRecording,
    trimSilence,
    reduceNoise
  };
};