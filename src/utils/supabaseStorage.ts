import { supabase } from '../lib/supabase';

export const uploadRecording = async (file: Blob, userId: string): Promise<string | null> => {
  try {
    // Create a unique filename with timestamp and user ID
    const timestamp = new Date().toISOString();
    const filename = `${userId}/${timestamp}.wav`;
    
    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from('recordings')
      .upload(filename, file, {
        contentType: 'audio/wav',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage error:', error);
      throw error;
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('recordings')
      .getPublicUrl(filename);

    // Save the recording metadata to the database
    const { error: dbError } = await supabase
      .from('recordings')
      .insert([
        {
          user_id: userId,
          file_path: filename,
          public_url: publicUrl,
          created_at: timestamp
        }
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return publicUrl;
  } catch (error) {
    console.error('Error uploading recording:', error);
    return null;
  }
};

export const getRecordings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return [];
  }
};