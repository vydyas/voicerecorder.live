import React from 'react';
import { Scissors, Wand2 } from 'lucide-react';

interface AudioProcessingControlsProps {
  onTrimSilence: () => void;
  onReduceNoise: () => void;
  isProcessing: boolean;
  hasRecording: boolean;
}

const AudioProcessingControls: React.FC<AudioProcessingControlsProps> = ({
  onTrimSilence,
  onReduceNoise,
  isProcessing,
  hasRecording
}) => {
  return (
    <div className="flex gap-2 mt-4">
      {/* <button
        onClick={onTrimSilence}
        disabled={!hasRecording || isProcessing}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          hasRecording && !isProcessing
            ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Scissors className="w-4 h-4" />
        <span>Trim Silence</span>
      </button> */}

      <button
        onClick={onReduceNoise}
        disabled={!hasRecording || isProcessing}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          hasRecording && !isProcessing
            ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Wand2 className="w-4 h-4" />
        <span>Reduce Noise</span>
      </button>
    </div>
  );
};

export default AudioProcessingControls;