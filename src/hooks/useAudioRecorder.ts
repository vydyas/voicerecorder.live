import { useState, useRef } from 'react';
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
  saveRecording: () => Promise<void>;
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
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        currentBlobRef.current = audioBlob;
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setLastSavedUrl(null);

      timerIntervalRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const saveRecording = async () => {
    if (!currentBlobRef.current || !userId) return;
    
    setIsSaving(true);
    try {
      const publicUrl = await uploadRecording(currentBlobRef.current, userId);
      if (publicUrl) {
        setLastSavedUrl(publicUrl);
      }
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