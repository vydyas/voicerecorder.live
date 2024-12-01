import React from 'react';
import { Play, Pause, Calendar } from 'lucide-react';

interface DemoRecording {
  id: string;
  title: string;
  date: string;
  duration: string;
  audioUrl: string;
  category: string;
}

const demoRecordings: DemoRecording[] = [
  {
    id: '1',
    title: 'Nature Sounds',
    date: 'March 15, 2024',
    duration: '1:23',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2434/2434-preview.mp3',
    category: 'Nature'
  },
  {
    id: '2',
    title: 'Piano Melody',
    date: 'March 14, 2024',
    duration: '0:45',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3',
    category: 'Music'
  },
  {
    id: '3',
    title: 'Voice Note',
    date: 'March 13, 2024',
    duration: '2:10',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
    category: 'Voice'
  }
];

const DemoRecordings: React.FC = () => {
  const [playing, setPlaying] = React.useState<string | null>(null);

  const handlePlay = (id: string, audioUrl: string) => {
    const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
    
    if (playing === id) {
      audio.pause();
      setPlaying(null);
    } else {
      // Pause any currently playing audio
      if (playing) {
        const currentAudio = document.getElementById(`audio-${playing}`) as HTMLAudioElement;
        currentAudio.pause();
      }
      audio.play();
      setPlaying(id);
    }
  };

  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Demo Recordings
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Listen to sample recordings made with our voice recorder
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoRecordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <button
                  onClick={() => handlePlay(recording.id, recording.audioUrl)}
                  className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                >
                  {playing === recording.id ? (
                    <Pause className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <Play className="w-8 h-8 text-indigo-600 ml-1" />
                  )}
                </button>
                <audio
                  id={`audio-${recording.id}`}
                  src={recording.audioUrl}
                  onEnded={() => setPlaying(null)}
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {recording.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {recording.duration}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {recording.title}
                </h3>

                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {recording.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoRecordings;