import React, { useState, useEffect } from 'react';
import { Share2, Download, Loader2, Copy, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import VoiceRecorder from '../VoiceRecorder/VoiceRecorder';

interface Recording {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  isPublic: boolean;
  shareableLink?: string;
}

export default function RecordingsPage() {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRecordings();
    }
  }, [user]);

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/recordings');
      const data = await response.json();
      setRecordings(data);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecording = (newRecording: Recording) => {
    setRecordings((prevRecordings) => [...prevRecordings, newRecording]);
  };

  const handleShare = async (recordingId: string) => {
    try {
      const response = await fetch(`/api/recordings/${recordingId}/share`, {
        method: 'POST',
      });
      const { shareableLink } = await response.json();
      
      setRecordings(recordings.map(rec => 
        rec.id === recordingId 
          ? { ...rec, isPublic: true, shareableLink } 
          : rec
      ));
    } catch (error) {
      console.error('Error generating shareable link:', error);
    }
  };

  const copyToClipboard = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to view your recordings.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <VoiceRecorder addRecording={addRecording} />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Recordings</h1>
          
          <div className="space-y-6">
            {recordings.map((recording) => (
              <div 
                key={recording.id}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {recording.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Recorded on {new Date(recording.createdAt).toLocaleDateString()}
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <audio 
                        src={recording.url} 
                        controls 
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[140px]">
                    <button
                      onClick={() => window.open(recording.url, '_blank')}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>

                    {recording.shareableLink ? (
                      <button
                        onClick={() => copyToClipboard(recording.shareableLink!, recording.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors w-full"
                      >
                        {copiedId === recording.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleShare(recording.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {recordings.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">You don't have any recordings yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
