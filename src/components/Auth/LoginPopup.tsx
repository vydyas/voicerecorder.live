import React from 'react';
import { X } from 'lucide-react';
import LoginButton from './LoginButton';

interface LoginPopupProps {
  onClose: () => void;
  message?: string;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ onClose, message }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to Record</h2>
          {message && (
            <p className="text-sm text-gray-600 mb-4">{message}</p>
          )}
          <p className="text-gray-600">
            Create an account or sign in to start recording and saving your voice notes.
          </p>
        </div>

        <div className="flex justify-center">
          <LoginButton />
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;