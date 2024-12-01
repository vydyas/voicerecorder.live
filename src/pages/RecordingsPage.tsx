import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRecordings } from '../utils/supabaseStorage';
import { formatDate } from '../utils/timeUtils';
import { Download, Loader2, Music2, Calendar, Clock } from 'lucide-react';

interface Recording {
  id: string;
  created_at: string;
  public_url: string;
}

const RecordingsPage: React.FC = () => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const downloadRecording = (url: string, timestamp: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${timestamp}.wav`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your recordings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Music2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Recordings</h1>
          </div>
          
          {recordings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Music2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Recordings Yet</h2>
              <p className="text-gray-600 mb-6">
                Start recording your voice notes to see them appear here.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Create Your First Recording
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex flex-col gap-2">
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
                      <button
                        onClick={() => downloadRecording(recording.public_url, recording.created_at)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                      >
                        <Download size={18} />
                        <span>Download</span>
                      </button>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingsPage;