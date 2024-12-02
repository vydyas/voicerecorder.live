import React, { useState } from 'react';
import { Save, X, Download } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';

interface AudioSavePanelProps {
  audioURL: string;
  recordingName: string;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onClose: () => void;
  onDownload: () => void;
}

const AudioSavePanel: React.FC<AudioSavePanelProps> = ({
  audioURL,
  recordingName,
  isSaving,
  onNameChange,
  onSave,
  onClose,
  onDownload,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClose = () => {
    setShowConfirm(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Panel */}
        <div className="relative w-full md:w-[600px] h-full md:h-auto md:max-h-[80vh] bg-white shadow-xl transition-all duration-300 ease-out">
          <div className="h-full md:h-auto flex flex-col md:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Save Recording</h3>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <div>
                <label htmlFor="recordingName" className="block text-sm font-medium text-gray-700 mb-1">
                  Recording Name
                </label>
                <input
                  type="text"
                  id="recordingName"
                  value={recordingName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Enter recording name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <audio src={audioURL} controls className="w-full" />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-5 border-t bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save size={20} />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={onDownload}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onConfirm={onClose}
        onCancel={() => setShowConfirm(false)}
        title="Discard Recording?"
        message="If you close without saving, your recording will be lost. Are you sure you want to discard it?"
      />
    </>
  );
};

export default AudioSavePanel;
