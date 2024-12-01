import React, { useState, useRef, useEffect } from 'react';
import { Settings, Mic, RefreshCcw } from 'lucide-react';
import { useAudioDevices } from '../../hooks/useAudioDevices';

interface AudioSettingsProps {
  onDeviceSelect: (deviceId: string) => void;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({ onDeviceSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { devices, selectedDevice, setSelectedDevice, isLoading, refreshDevices } = useAudioDevices();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId);
    onDeviceSelect(deviceId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        title="Audio Settings"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 animate-fadeIn">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Audio Settings</h3>
              <button
                onClick={refreshDevices}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Refresh devices"
              >
                <RefreshCcw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-2 text-sm text-gray-600">
                Loading devices...
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-2 text-sm text-gray-600">
                No audio devices found
              </div>
            ) : (
              <div className="space-y-1">
                {devices.map((device) => (
                  <button
                    key={device.deviceId}
                    onClick={() => handleDeviceSelect(device.deviceId)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                      selectedDevice === device.deviceId
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span className="truncate">{device.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioSettings;