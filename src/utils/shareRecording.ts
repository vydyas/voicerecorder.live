import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const generateShareUrl = async (recordingId: string) => {
  try {
    // Get the recording
    const { data: recording, error: fetchError } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recordingId)
      .single();

    if (fetchError || !recording) {
      throw new Error(fetchError?.message || 'Recording not found');
    }

    // Generate a unique share ID
    const shareId = uuidv4();

    // Update the recording with the share ID
    const { error: updateError } = await supabase
      .from('recordings')
      .update({ share_id: shareId })
      .eq('id', recordingId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Create a signed URL for immediate use
    const { data: signedUrl, error: signError } = await supabase
      .storage
      .from('recordings')
      .createSignedUrl(recording.file_path, 7 * 24 * 60 * 60); // 7 days in seconds

    if (signError) {
      throw new Error(signError.message);
    }

    // Return both the share ID and the temporary signed URL
    return { 
      shareUrl: `${window.location.origin}/shared/${shareId}`,
      signedUrl: signedUrl?.signedUrl 
    };
  } catch (error) {
    console.error('Error generating share link:', error);
    throw error;
  }
};
