import { useEffect, useState } from 'react';

export default function useVolumeMeter() {
  const [isListening, setIsListening] = useState(false);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!isListening) return;

    let audioContext;
    let animationId;
    let mediaStream;

    const startAudio = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        
        // Smaller FFT size gives faster response for a volume meter
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        const microphone = audioContext.createMediaStreamSource(mediaStream);
        microphone.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / dataArray.length);
          
          // Normalize to 0–100% (128 is a practical ceiling for typical mic speech)
          setLevel(Math.min(100, Math.round((rms / 128) * 100)));

          animationId = requestAnimationFrame(updateMeter);
        };

        updateMeter();
      } catch (err) {
        //setError('Microphone access denied or unavailable.');
        setIsListening(false);
      }
    };

    startAudio();

    // Cleanup streams, animation frames, and AudioContext on unmount/stop
    return () => {
      cancelAnimationFrame(animationId);
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };
  }, [isListening]);

  return { level, setIsListening } 
}