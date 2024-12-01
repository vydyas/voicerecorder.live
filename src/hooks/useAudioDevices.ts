import { useState, useEffect } from 'react';

export interface AudioDevice {
  deviceId: string;
  label: string;
}

export const useAudioDevices = () => {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDevices = async () => {
    try {
      // Request permission to access media devices
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = allDevices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${devices.length + 1}`
        }));

      setDevices(audioDevices);
      
      // Set default device if none selected
      if (!selectedDevice && audioDevices.length > 0) {
        setSelectedDevice(audioDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error loading audio devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', loadDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
    };
  }, []);

  return {
    devices,
    selectedDevice,
    setSelectedDevice,
    isLoading,
    refreshDevices: loadDevices
  };
};