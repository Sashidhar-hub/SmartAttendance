import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Upload, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FaceGuideOverlay from './FaceGuideOverlay';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function CameraCapture({ 
  onCapture, 
  facingMode = 'user', 
  showFaceGuide = true,
  instruction = 'Position your face within the oval',
  allowUpload = false 
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please grant permission.');
      setIsLoading(false);
    }
  }, [facingMode, stream]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 text-center">
        <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
        <Button onClick={startCamera} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-[3/4] max-w-md mx-auto">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <LoadingSpinner size="lg" text="Starting camera..." />
          </div>
        )}
        
        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            {showFaceGuide && <FaceGuideOverlay instruction={instruction} />}
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-center gap-3">
        {capturedImage ? (
          <>
            <Button
              onClick={retakePhoto}
              variant="outline"
              className="px-6 py-3 rounded-xl"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake
            </Button>
            <Button
              onClick={confirmCapture}
              className="px-6 py-3 rounded-xl bg-[#22c55e] hover:bg-green-600"
            >
              <Check className="w-5 h-5 mr-2" />
              Confirm
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={capturePhoto}
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-[#2563eb] hover:bg-blue-700"
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture
            </Button>
            {allowUpload && (
              <>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="px-6 py-3 rounded-xl"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}