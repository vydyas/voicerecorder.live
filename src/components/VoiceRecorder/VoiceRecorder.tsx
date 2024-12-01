import React, { useState } from 'react';
import { Mic, Square, Download, Loader2, Pause, Play, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import WaveformVisualizer from './WaveformVisualizer';
import RecordingTimer from './RecordingTimer';
import LoginPopup from '../Auth/LoginPopup';
import AudioSettings from './AudioSettings';
import AudioProcessingControls from './AudioProcessingControls';

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
          
          {audioURL && !isRecording && (
            <>
              <div className="mt-6">
                <audio controls className="w-full" src={audioURL}>
                  Your browser does not support the audio element.
                </audio>
              </div>
              
              <div className="flex gap-2 mt-4 justify-center">
                <button
                  onClick={saveRecording}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200"
                >
                  <Save size={20} />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>

                <button
                  onClick={downloadRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-200"
                >
                  <Download size={20} />
                  <span>Download</span>
                </button>

                <button
                  onClick={deleteRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200"
                >
                  <Trash2 size={20} />
                  <span>Delete</span>
                </button>
              </div>
              
              <AudioProcessingControls
                onTrimSilence={trimSilence}
                onReduceNoise={reduceNoise}
                isProcessing={isProcessing}
                hasRecording={!!audioURL}
              />
            </>
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