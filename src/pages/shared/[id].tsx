import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSharedRecording } from '../../utils/supabaseStorage';
import { supabase } from '../../utils/supabaseClient';

interface SharedRecording {
  id: string;
  name: string;
  created_at: string;
  public_url: string;
}

const SharedRecordingPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [recording, setRecording] = useState<SharedRecording | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecording = async () => {
      if (!id) return;
      
      try {
        const rec = await getSharedRecording(id as string);
        if (!rec) {
          setError('Recording not found');
          return;
        }

        // Get a fresh signed URL for playback
        const { data: signedUrl } = await supabase
          .storage
          .from('recordings')
          .createSignedUrl(rec.path, 3600); // 1 hour expiry

        setRecording({
          ...rec,
          public_url: signedUrl?.signedUrl || ''
        });
      } catch (err) {
        console.error('Error fetching shared recording:', err);
        setError('Failed to load recording');
      } finally {
        setLoading(false);
      }
    };

    fetchRecording();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recording...</p>
        </div>
      </div>
    );
  }

  if (error || !recording) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'Recording not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{recording.name || 'Shared Recording'}</h1>
        <div className="text-sm text-gray-500 mb-4">
          Shared on {new Date(recording.created_at).toLocaleDateString()}
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <audio 
            controls 
            src={recording.public_url} 
            className="w-full"
            controlsList="nodownload"
          />
        </div>
      </div>
    </div>
  );
};

export default SharedRecordingPage;
