import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AuthErrorProps {
  message: string;
}

const AuthError: React.FC<AuthErrorProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex items-center">
        <AlertCircle className="text-red-500 mr-2" size={20} />
        <p className="text-red-700">{message}</p>
      </div>
    </div>
  );
};

export default AuthError;