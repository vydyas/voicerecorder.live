import React, { Suspense, lazy } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Features from '../components/Landing/Features';
import DemoRecordings from '../components/Landing/DemoRecordings';

const VoiceRecorder = lazy(() => import('../components/VoiceRecorder/VoiceRecorder'));

const HomePage: React.FC = () => {
  return (
    <div>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Online Voice Recorder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A convenient and simple online tool that lets you record your voice using a microphone 
            right in your browser. Free to use, secure, and packed with features.
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <VoiceRecorder />
        </Suspense>
      </div>

      <DemoRecordings />
      <Features />
    </div>
  );
};

export default HomePage;