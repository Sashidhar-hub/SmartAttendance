import React, { useRef, useState, useEffect } from 'react';
import { QrCode, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function QRScanner({ onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    startScanner();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanner = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsLoading(false);
          startQRDetection();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera for QR scanning.');
      setIsLoading(false);
    }
  };

  const startQRDetection = () => {
    // Simulate QR code detection
    // In production, you would use a QR code library like jsQR
    const checkForQR = setInterval(() => {
      if (!scanning) {
        clearInterval(checkForQR);
        return;
      }
      
      // Simulate finding a QR code after a random delay
      if (Math.random() > 0.95) {
        clearInterval(checkForQR);
        setScanning(false);
        
        // Simulate QR data
        const mockQRData = {
          sessionId: `SESSION-${Date.now().toString(36).toUpperCase()}`,
          courseName: 'Advanced Mathematics',
          date: new Date().toISOString().split('T')[0]
        };
        
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        onScan(mockQRData);
      }
    }, 100);

    // Timeout after 30 seconds
    setTimeout(() => {
      if (scanning) {
        clearInterval(checkForQR);
      }
    }, 30000);
  };

  // Manual QR input for demo
  const handleManualInput = () => {
    const mockQRData = {
      sessionId: `SESSION-${Date.now().toString(36).toUpperCase()}`,
      courseName: 'Advanced Mathematics',
      date: new Date().toISOString().split('T')[0]
    };
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    onScan(mockQRData);
  };

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 text-center">
        <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
        <Button onClick={startScanner} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-square max-w-md mx-auto">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <LoadingSpinner size="lg" text="Starting scanner..." />
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* QR Scanner overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner markers */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Top left */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#2563eb] rounded-tl-lg" />
              {/* Top right */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#2563eb] rounded-tr-lg" />
              {/* Bottom left */}
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#2563eb] rounded-bl-lg" />
              {/* Bottom right */}
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#2563eb] rounded-br-lg" />
              
              {/* Scanning line animation */}
              <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-[#2563eb] to-transparent animate-pulse" 
                style={{ animation: 'scanLine 2s ease-in-out infinite' }} />
            </div>
          </div>
          
          {/* Instruction */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <div className="bg-black/70 text-white px-6 py-3 rounded-2xl flex items-center gap-2 backdrop-blur-sm">
              <QrCode className="w-5 h-5" />
              <span className="text-sm font-medium">Align QR code within the frame</span>
            </div>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Demo button for testing */}
      <div className="flex justify-center">
        <Button
          onClick={handleManualInput}
          variant="outline"
          className="px-6 py-3 rounded-xl"
        >
          <Camera className="w-5 h-5 mr-2" />
          Simulate QR Scan (Demo)
        </Button>
      </div>

      <style jsx>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(240px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}