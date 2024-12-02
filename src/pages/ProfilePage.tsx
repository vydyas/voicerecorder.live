import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Music2, Calendar, UserIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Recording {
  id: string;
  created_at: string;
  name: string;
  public_url: string;
  file_path: string;
}

interface Profile {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        // Get user data directly from auth.users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, raw_user_meta_data')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          setError('User not found');
          return;
        }

        setProfile({
          id: userData.id,
          email: userData.email,
          user_metadata: userData.raw_user_meta_data
        });

        // Fetch public recordings
        const { data: recordings, error: recordingsError } = await supabase
          .from('recordings')
          .select('*')
          .eq('user_id', userId)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (recordingsError) throw recordingsError;

        // Get signed URLs for each recording
        const recordingsWithUrls = await Promise.all(
          (recordings || []).map(async (recording) => {
            const { data } = await supabase
              .storage
              .from('recordings')
              .createSignedUrl(recording.file_path, 3600);

            return {
              ...recording,
              public_url: data?.signedUrl || ''
            };
          })
        );

        setRecordings(recordingsWithUrls);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            {profile?.user_metadata?.avatar_url ? (
              <img
                src={profile.user_metadata.avatar_url}
                alt="Profile"
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-indigo-600" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.user_metadata?.full_name || 'Anonymous User'}
              </h1>
              <p className="text-gray-500">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Recordings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Music2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-medium text-gray-900">
                    {recording.name || 'Untitled Recording'}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(recording.created_at).toLocaleDateString()}
                </div>
              </div>
              <audio
                controls
                src={recording.public_url}
                className="w-full"
                controlsList="nodownload"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          ))}
        </div>

        {recordings.length === 0 && (
          <div className="text-center py-12">
            <Music2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Public Recordings
            </h2>
            <p className="text-gray-500">
              This user hasn't shared any public recordings yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
