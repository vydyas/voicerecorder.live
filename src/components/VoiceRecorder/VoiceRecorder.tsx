import React, { useState } from 'react';
import { Mic, Square, Download, Loader2, Pause, Play } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import WaveformVisualizer from './WaveformVisualizer';
import RecordingTimer from './RecordingTimer';
import LoginPopup from '../Auth/LoginPopup';
import AudioSettings from './AudioSettings';

const VoiceRecorder: React.FC = () => {
  const { user } = useAuth();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const {
    isRecording,
    isPaused,
    audioURL,
    duration,
    isSaving,
    lastSavedUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording
  } = useAudioRecorder({ 
    userId: user?.id,
    deviceId: selectedDeviceId
  });

  const handleRecordClick = async () => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    await startRecording();
  };

  return (
    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Voice Recorder</h1>
          <AudioSettings onDeviceSelect={setSelectedDeviceId} />
        </div>
        
        <div className="relative">
          <WaveformVisualizer isRecording={isRecording && !isPaused} />
          
          <div className="flex flex-col items-center gap-6">
            <RecordingTimer duration={duration} isRecording={isRecording} isPaused={isPaused} />
            
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <button
                  onClick={handleRecordClick}
                  className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Mic size={24} />
                </button>
              ) : (
                <>
                  <button
                    onClick={stopRecording}
                    className="bg-gray-700 hover:bg-gray-800 text-white p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Square size={24} />
                  </button>
                  <button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isPaused ? <Play size={24} /> : <Pause size={24} />}
                  </button>
                </>
              )}
              
              {audioURL && !isRecording && (
                <button
                  onClick={downloadRecording}
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Download size={24} />
                </button>
              )}
            </div>

            {isSaving && (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="animate-spin" size={20} />
                <span>Saving recording...</span>
              </div>
            )}

            {lastSavedUrl && (
              <div className="text-sm text-green-600">
                Recording saved successfully!
              </div>
            )}
          </div>
          
          {audioURL && !isRecording && (
            <div className="mt-6">
              <audio controls className="w-full" src={audioURL}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        {showLoginPopup && (
          <LoginPopup onClose={() => setShowLoginPopup(false)} />
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;