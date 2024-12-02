import { supabase } from '../lib/supabase';

export const uploadRecording = async (file: Blob, userId: string, name: string): Promise<string | null> => {
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
          created_at: timestamp,
          name: name || `Recording ${timestamp}`
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
      .select('id, created_at, public_url, name, file_path')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return [];
  }
};

export const deleteRecording = async (userId: string, recordingId: string) => {
  try {
    // First get the file path from the database
    const { data: recordingData, error: fetchError } = await supabase
      .from('recordings')
      .select('file_path')
      .eq('id', recordingId)
      .single();

    if (fetchError) throw fetchError;
    if (!recordingData?.file_path) throw new Error('File path not found');

    // Delete from storage using the correct file path
    const { error: storageError } = await supabase
      .storage
      .from('recordings')
      .remove([recordingData.file_path]);

    if (storageError) throw storageError;

    // Delete from recordings table
    const { error: dbError } = await supabase
      .from('recordings')
      .delete()
      .match({ id: recordingId, user_id: userId });

    if (dbError) throw dbError;

    return { success: true };
  } catch (error) {
    console.error('Error deleting recording:', error);
    return { success: false, error };
  }
};

export const updateRecordingName = async (recordingId: string, userId: string, newName: string) => {
  try {
    const { data, error } = await supabase
      .from('recordings')
      .update({ name: newName })
      .match({ id: recordingId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating recording name:', error);
    return { success: false, error };
  }
};