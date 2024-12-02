import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { recordingId } = req.query;

  if (!recordingId) {
    return res.status(400).json({ error: 'Recording ID is required' });
  }

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

    // Create a signed URL that expires in 7 days
    const { data: signedUrl, error: signError } = await supabase
      .storage
      .from('recordings')
      .createSignedUrl(recording.path, 7 * 24 * 60 * 60); // 7 days in seconds

    if (signError) {
      throw new Error(signError.message);
    }

    // Update the recording with the share URL
    const { error: updateError } = await supabase
      .from('recordings')
      .update({ share_url: signedUrl })
      .eq('id', recordingId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return res.status(200).json({ shareUrl: signedUrl });
  } catch (error) {
    console.error('Error generating share link:', error);
    return res.status(500).json({ error: 'Failed to generate share link' });
  }
}
