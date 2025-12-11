import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eye, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FaceGuideOverlay from './FaceGuideOverlay';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function LivenessDetector({ onSuccess, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [livenessStatus, setLivenessStatus] = useState('waiting'); // waiting, detecting, passed, failed
  const [instruction, setInstruction] = useState('Position your face and blink or turn your head');
  const [countdown, setCountdown] = useState(5);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsLoading(false);
          startLivenessDetection();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startLivenessDetection = () => {
    setLivenessStatus('detecting');
    setInstruction('Blink your eyes or turn your head slowly...');
    
    // Simulate liveness detection with countdown
    let count = 5;
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 3) {
        setInstruction('Keep moving... detecting liveness');
      }
      
      if (count <= 0) {
        clearInterval(interval);
        // Simulate successful liveness detection
        const passed = Math.random() > 0.15; // 85% success rate simulation
        
        if (passed) {
          setLivenessStatus('passed');
          setInstruction('Liveness verified! Capturing photo...');
          setTimeout(() => capturePhoto(), 500);
        } else {
          setLivenessStatus('failed');
          setInstruction('Liveness check failed. Please try again.');
        }
      }
    }, 1000);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
      
      // Stop the camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onSuccess(true);
      onCapture(capturedImage);
    }
  };

  const retryLiveness = () => {
    setCapturedImage(null);
    setLivenessStatus('waiting');
    setCountdown(5);
    startCamera();
  };

  const getStatusColor = () => {
    switch (livenessStatus) {
      case 'passed': return 'text-[#22c55e]';
      case 'failed': return 'text-red-500';
      default: return 'text-[#2563eb]';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-[3/4] max-w-md mx-auto">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <LoadingSpinner size="lg" text="Starting camera..." />
          </div>
        )}
        
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <FaceGuideOverlay instruction={instruction} />
            
            {/* Liveness status indicator */}
            {livenessStatus === 'detecting' && (
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
                  <div className="w-3 h-3 bg-[#2563eb] rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Detecting liveness... {countdown}s</span>
                </div>
              </div>
            )}
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Status overlay */}
        {livenessStatus !== 'waiting' && livenessStatus !== 'detecting' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              {livenessStatus === 'passed' ? (
                <Check className="w-16 h-16 text-[#22c55e] mx-auto mb-2" />
              ) : (
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
              )}
              <p className={`font-semibold text-lg ${getStatusColor()}`}>
                {livenessStatus === 'passed' ? 'Liveness Verified!' : 'Verification Failed'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        {livenessStatus === 'failed' && (
          <Button onClick={retryLiveness} className="px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-blue-700">
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
        )}
        {livenessStatus === 'passed' && capturedImage && (
          <Button onClick={confirmCapture} className="px-8 py-3 rounded-xl bg-[#22c55e] hover:bg-green-600">
            <Check className="w-5 h-5 mr-2" />
            Continue
          </Button>
        )}
      </div>

      {/* Liveness tips */}
      <div className="bg-blue-50 rounded-xl p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-[#2563eb] mt-0.5" />
          <div>
            <p className="font-medium text-[#111827] text-sm">Liveness Tips</p>
            <p className="text-xs text-[#4b5563] mt-1">
              Blink naturally or slowly turn your head left and right. Ensure good lighting and keep your face centered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}