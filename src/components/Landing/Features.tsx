import React from 'react';
import { Mic, Lock, Scissors, Volume2, Zap, Check } from 'lucide-react';

const features = [
  {
    icon: <Mic className="w-6 h-6 text-indigo-500" />,
    title: "Browser-Based Recording",
    description: "Our Voice Recorder is a convenient and simple online tool that can be used right in your browser. Record your voice using a microphone and save it as an audio file."
  },
  {
    icon: <Check className="w-6 h-6 text-green-500" />,
    title: "Free to Use",
    description: "Voice Recorder is completely free. No hidden payments, activation fees, or charges for extra features."
  },
  {
    icon: <Volume2 className="w-6 h-6 text-blue-500" />,
    title: "Microphone Settings",
    description: "You can adjust your microphone settings using your browser's built-in tools, including decreasing echo and adjusting the volume."
  },
  {
    icon: <Lock className="w-6 h-6 text-red-500" />,
    title: "Privacy Guaranteed",
    description: "We guarantee that our app is secure. Your recordings are only accessible to you: nothing is stored without your explicit permission."
  },
  {
    icon: <Scissors className="w-6 h-6 text-purple-500" />,
    title: "Cut Your Recording",
    description: "After the recording is complete, you can crop it to the section you actually need."
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    title: "Auto Silence Trimming",
    description: "Voice Recorder automatically detects silent fragments at the beginning and the end of your recording and deletes them for your convenience."
  }
];

const Features: React.FC = () => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Everything you need in a voice recorder
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Simple, powerful, and free voice recording right in your browser
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="ml-3 text-xl font-medium text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;