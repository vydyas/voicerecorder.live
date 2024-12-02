import React, { useState } from 'react';
import { Mic, Square, Download, Loader2, Pause, Play, Save, Trash2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import WaveformVisualizer from './WaveformVisualizer';
import LoginPopup from '../Auth/LoginPopup';
import AudioSettings from './AudioSettings';
import AudioProcessingControls from './AudioProcessingControls';
import AudioSavePanel from './AudioSavePanel';

const VoiceRecorder: React.FC = () => {
  const { user } = useAuth();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [recordingName, setRecordingName] = useState('');
  const [showSavePanel, setShowSavePanel] = useState(false);

  const {
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    saveRecording,
    downloadRecording,
    deleteRecording,
    audioURL,
    duration,
    isSaving,
    isProcessing,
    lastSavedUrl
  } = useAudioRecorder({ 
    userId: user?.id, 
    deviceId: selectedDeviceId 
  });

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeClassName = (duration: number) => {
    if (duration <= 10) {
      return 'text-red-600';
    }
    if (duration <= 30) {
      return 'text-yellow-600';
    }
    return 'text-gray-600';
  };

  const handleStopRecording = () => {
    stopRecording();
    setShowSavePanel(true);
  };

  const handleSave = () => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    saveRecording(recordingName || `Recording ${new Date().toISOString()}`);
    setShowSavePanel(false);
  };

  const handleClosePanel = () => {
    setShowSavePanel(false);
    deleteRecording();
    setRecordingName('');
  };

  const handleRecordClick = async () => {
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
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-700">
                {formatTime(duration)}
              </div>
              {!user && !isRecording && (
                <p className="text-sm text-gray-500 mt-2">
                  You can record without logging in, but you'll need to log in to save
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <button
                  onClick={handleRecordClick}
                  className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                  aria-label="Start Recording"
                >
                  <Mic size={24} aria-hidden="true" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleStopRecording}
                    className="bg-gray-700 hover:bg-gray-800 text-white p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                    aria-label="Stop Recording"
                  >
                    <Square size={24} aria-hidden="true" />
                  </button>
                  <button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                    aria-label={isPaused ? "Resume Recording" : "Pause Recording"}
                  >
                    {isPaused ? <Play size={24} /> : <Pause size={24} />}
                  </button>
                </>
              )}
            </div>

            {(isSaving || isProcessing) && (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="animate-spin" size={20} />
                <span>{isProcessing ? 'Processing audio...' : 'Saving recording...'}</span>
              </div>
            )}

            {lastSavedUrl && (
              <div className="text-sm text-green-600">
                Recording saved successfully!
              </div>
            )}
          </div>

          {isRecording && (
            <div className={`text-sm ${getTimeClassName(duration)}`}>
              Time remaining: {formatTime(120 - duration)}
            </div>
          )}
        </div>
      </div>

      {showLoginPopup && (
        <LoginPopup 
          onClose={() => setShowLoginPopup(false)} 
          message="Please log in to save your recording"
        />
      )}

      {showSavePanel && audioURL && (
        <AudioSavePanel
          audioURL={audioURL}
          recordingName={recordingName}
          isSaving={isSaving}
          onNameChange={setRecordingName}
          onSave={handleSave}
          onClose={handleClosePanel}
          onDownload={downloadRecording}
          requiresLogin={!user}
        />
      )}
    </div>
  );
};

export default VoiceRecorder;