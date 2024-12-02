import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRecordings, deleteRecording, updateRecordingName } from '../utils/supabaseStorage';
import { formatDate } from '../utils/timeUtils';
import { convertToFormat } from '../utils/audioFormatConverter';
import { Download, Loader2, Music2, Calendar, Clock, Trash2, Pencil, Check, X } from 'lucide-react';
import RecordingShimmer from '../components/Loading/RecordingShimmer';

interface Recording {
  id: string;
  created_at: string;
  public_url: string;
  name: string;
}

const RecordingsPage: React.FC = () => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isConverting, setIsConverting] = useState<string | null>(null);

  useEffect(() => {
    const loadRecordings = async () => {
      if (user) {
        const data = await getRecordings(user.id);
        setRecordings(data);
        setIsLoading(false);
      }
    };

    loadRecordings();
  }, [user]);

  const downloadRecording = async (recording: Recording, format: 'mp3' | 'wav') => {
    try {
      setIsConverting(recording.id);
      let blob: Blob;
      
      if (format === 'wav') {
        const response = await fetch(recording.public_url);
        if (!response.ok) throw new Error('Failed to fetch recording');
        blob = await response.blob();
      } else {
        try {
          blob = await convertToFormat(recording.public_url, format);
        } catch (error) {
          console.error('Conversion error:', error);
          alert('Failed to convert to MP3. Please try downloading as WAV instead.');
          return;
        }
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording.name || 'recording'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading recording:', error);
      alert('Failed to download recording. Please try again.');
    } finally {
      setIsConverting(null);
    }
  };

  const handleDelete = async (recordingId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this recording?')) return;
    
    setIsDeleting(recordingId);
    const result = await deleteRecording(user.id, recordingId);
    
    if (result.success) {
      setRecordings(recordings.filter(rec => rec.id !== recordingId));
    } else {
      alert('Failed to delete recording. Please try again.');
    }
    setIsDeleting(null);
  };

  const handleEditName = async (recordingId: string) => {
    if (!user || !editingName.trim()) return;
    
    try {
      const result = await updateRecordingName(recordingId, user.id, editingName.trim());
      if (result.success) {
        setRecordings(recordings.map(rec => 
          rec.id === recordingId ? { ...rec, name: editingName.trim() } : rec
        ));
      } else {
        alert('Failed to update recording name. Please try again.');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update recording name. Please try again.');
    }
    setEditingId(null);
    setEditingName('');
  };

  const pageContent = isLoading ? (
    <RecordingShimmer />
  ) : recordings.length === 0 ? (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">No recordings yet. Start recording to see them here!</p>
    </div>
  ) : (
    <div className="max-w-3xl mx-auto space-y-4">
      {recordings.map((recording) => (
        <div
          key={recording.id}
          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex flex-col gap-2">
                {editingId === recording.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEditName(recording.id)}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingName('');
                      }}
                      className="p-1 text-gray-600 hover:text-gray-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {recording.name || `Recording #${recordings.indexOf(recording) + 1}`}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingId(recording.id);
                        setEditingName(recording.name || '');
                      }}
                      className="p-1 text-gray-600 hover:text-gray-700"
                      title="Edit name"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {formatDate(recording.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Recording #{recordings.indexOf(recording) + 1}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => {
                      const menu = document.getElementById(`download-menu-${recording.id}`);
                      if (menu) menu.classList.toggle('hidden');
                    }}
                    disabled={isConverting === recording.id}
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors duration-200 ${
                      isConverting === recording.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isConverting === recording.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                    <span>{isConverting === recording.id ? 'Converting...' : 'Download'}</span>
                  </button>
                  <div
                    id={`download-menu-${recording.id}`}
                    className="hidden absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          downloadRecording(recording, 'wav');
                          document.getElementById(`download-menu-${recording.id}`)?.classList.add('hidden');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Download as WAV
                      </button>
                      <button
                        onClick={() => {
                          downloadRecording(recording, 'mp3');
                          document.getElementById(`download-menu-${recording.id}`)?.classList.add('hidden');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Download as MP3
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(recording.id)}
                  disabled={isDeleting === recording.id}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isDeleting === recording.id
                      ? 'bg-red-100 text-red-400 cursor-not-allowed'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {isDeleting === recording.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <audio 
                controls 
                className="w-full" 
                src={recording.public_url}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Recordings</h1>
      </div>
      {pageContent}
    </div>
  );
};

export default RecordingsPage;