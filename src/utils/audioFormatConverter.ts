import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  
  try {
    // Use a specific version of FFmpeg that includes MP3 support
    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.2/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
    });
    
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    throw new Error('Failed to load FFmpeg');
  }
};

export const convertToFormat = async (audioUrl: string, format: 'mp3' | 'wav'): Promise<Blob> => {
  try {
    const ff = await loadFFmpeg();
    if (!ff) throw new Error('FFmpeg not initialized');

    // Download the file
    const audioData = await fetchFile(audioUrl);
    
    // Write input file
    await ff.writeFile('input.wav', audioData);
    
    // Set conversion parameters with more explicit MP3 settings
    const outputFilename = `output.${format}`;
    const command = format === 'mp3' 
      ? [
          '-i', 'input.wav',
          '-c:a', 'libmp3lame',
          '-b:a', '192k',  // Set bitrate
          '-ar', '44100',  // Set sample rate
          '-ac', '2',      // Set to stereo
          outputFilename
        ]
      : ['-i', 'input.wav', outputFilename];
    
    // Log the command for debugging
    console.log('FFmpeg command:', command);
    
    // Run conversion
    await ff.exec(command);
    
    // Read the output file
    const data = await ff.readFile(outputFilename);
    const uint8Array = new Uint8Array(data);
    
    // Clean up files
    await ff.deleteFile('input.wav');
    await ff.deleteFile(outputFilename);
    
    return new Blob([uint8Array], { 
      type: format === 'mp3' ? 'audio/mpeg' : 'audio/wav' 
    });
  } catch (error) {
    console.error('Error converting audio:', error);
    throw new Error(`Failed to convert audio to ${format}: ${error.message}`);
  }
};
