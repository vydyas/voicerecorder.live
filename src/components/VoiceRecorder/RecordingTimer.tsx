import React from 'react';
import { formatDuration } from '../../utils/timeUtils';

interface RecordingTimerProps {
  duration: number;
  isRecording: boolean;
  isPaused: boolean;
}

const RecordingTimer: React.FC<RecordingTimerProps> = ({ duration, isRecording, isPaused }) => {
  return (
    <div className="text-center">
      <div className="text-4xl font-mono font-bold text-gray-800">
        {formatDuration(duration)}
      </div>
      {isRecording && (
        <div className={`font-semibold mt-2 flex items-center gap-2 justify-center ${
          isPaused ? 'text-indigo-500' : 'text-red-500'
        }`}>
          {isPaused ? (
            'Paused'
          ) : (
            <>
              <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span>
              Recording
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordingTimer;