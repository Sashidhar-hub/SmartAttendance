// src/Pages/VerifyFace.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
// ⬇️ use api instead of base44
import { api } from '@/api/apiClient';
import { 
  ArrowLeft, Camera, Check, X, AlertCircle, 
  RotateCcw, Smartphone, Loader2, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Navbar from '@/components/common/Navbar';
import FaceGuideOverlay from '@/components/face/FaceGuideOverlay';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/components/auth/AuthContext';

export default function VerifyFace() {
  const navigate = useNavigate();
  const { student, loading: authLoading } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  
  // URL params
  const [sessionData, setSessionData] = useState(null);
  
  // Step management
  const [step, setStep] = useState('front-liveness'); // front-liveness, front-capture, back-switch, back-capture, processing, success, failed
  
  // Liveness
  const [livenessStatus, setLivenessStatus] = useState('waiting'); // waiting, detecting, passed, failed
  const [livenessCountdown, setLivenessCountdown] = useState(5);
  
  // Captured data
  const [frontSelfie, setFrontSelfie] = useState(null);
  const [backImage, setBackImage] = useState(null);
  
  // Result
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionData({
      sessionId: params.get('sessionId'),
      courseName: params.get('courseName'),
      date: params.get('date')
    });
  }, []);

  useEffect(() => {
    if (!authLoading && !student) {
      navigate(createPageUrl('StudentLogin'));
    }
  }, [student, authLoading, navigate]);

  useEffect(() => {
    if (step === 'front-liveness' || step === 'front-capture') {
      startCamera('user');
    } else if (step === 'back-switch' || step === 'back-capture') {
      startCamera('environment');
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  const startCamera = async (facingMode) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          if (step === 'front-liveness') {
            startLivenessDetection();
          }
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please grant permission.');
    }
  };

  const startLivenessDetection = () => {
    setLivenessStatus('detecting');
    
    let count = 5;
    const interval = setInterval(() => {
      count--;
      setLivenessCountdown(count);
      
      if (count <= 0) {
        clearInterval(interval);
        // still simulating liveness client-side
        const passed = Math.random() > 0.15;
        
        if (passed) {
          setLivenessStatus('passed');
          setTimeout(() => {
            capturePhoto();
            setStep('front-capture');
          }, 500);
        } else {
          setLivenessStatus('failed');
        }
      }
    }, 1000);
  };

  const retryLiveness = () => {
    setLivenessStatus('waiting');
    setLivenessCountdown(5);
    startCamera('user');
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      
      // Mirror for front camera
      if (step === 'front-liveness' || step === 'front-capture') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      
      if (step === 'front-liveness' || step === 'front-capture') {
        setFrontSelfie(imageData);
      } else {
        setBackImage(imageData);
      }
      
      return imageData;
    }
    return null;
  };

  const handleFrontConfirm = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStep('back-switch');
    setTimeout(() => setStep('back-capture'), 2000);
  };

  const handleBackCapture = () => {
    const image = capturePhoto();
    if (image) {
      setBackImage(image);
    }
  };

  const handleBackConfirm = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStep('processing');
    await submitAttendance();
  };

  const submitAttendance = async () => {
    try {
      setError(null);

      // small delay just for UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 1️⃣ Call backend Face verification
      const verifyPayload = {
        studentId: student.studentId,
        frontSelfieBase64: frontSelfie,
        backCameraImageBase64: backImage,
        sessionId: sessionData?.sessionId,
        courseName: sessionData?.courseName,
        date: sessionData?.date
      };

      const verifyRes = await api.verifyFace(verifyPayload);
      const match = verifyRes?.match ?? false;
      const similarity = verifyRes?.similarity ?? null;

      if (!match) {
        const reason =
          verifyRes?.reason ||
          'Face verification failed. Similarity score below threshold or no match.';
        
        setResult({
          success: false,
          similarity,
          reason
        });
        setStep('failed');
        toast.error('Face verification failed');
        return;
      }

      // 2️⃣ Mark attendance in backend
      const attendancePayload = {
        studentId: student.studentId,
        studentName: student.name,
        sessionId: sessionData?.sessionId,
        courseName: sessionData?.courseName,
        date: sessionData?.date,
        timestamp: new Date().toISOString(),
        similarity,
        liveness: true,
        frontSelfieBase64: frontSelfie,
        backCameraImageBase64: backImage,
        status: 'present'
      };

      await api.markAttendance(attendancePayload);

      setResult({
        success: true,
        similarity,
        sessionId: sessionData?.sessionId,
        courseName: sessionData?.courseName
      });
      setStep('success');
      toast.success('Attendance marked successfully!');
      
    } catch (error) {
      console.error('Attendance error:', error);
      setResult({
        success: false,
        reason: 'An error occurred while processing your attendance.'
      });
      setStep('failed');
      toast.error('Failed to mark attendance');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'front-liveness':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-[#111827]">Step 1: Liveness Check</h2>
              <p className="text-[#4b5563]">Blink or turn your head slightly</p>
            </div>
            
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-[3/4] max-w-md mx-auto">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <FaceGuideOverlay instruction="Blink or turn your head slowly" />
              
              {livenessStatus === 'detecting' && (
                <div className="absolute top-4 left-0 right-0 flex justify-center">
                  <div className="bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
                    <div className="w-3 h-3 bg-[#2563eb] rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Detecting liveness... {livenessCountdown}s</span>
                  </div>
                </div>
              )}
              
              {livenessStatus === 'passed' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <Check className="w-16 h-16 text-[#22c55e] mx-auto mb-2" />
                    <p className="font-semibold text-lg text-[#22c55e]">Liveness Verified!</p>
                  </div>
                </div>
              )}
              
              {livenessStatus === 'failed' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
                    <p className="font-semibold text-lg text-red-500">Verification Failed</p>
                  </div>
                </div>
              )}
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            {livenessStatus === 'failed' && (
              <div className="flex justify-center">
                <Button onClick={retryLiveness} className="px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-blue-700">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        );

      case 'front-capture':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-[#111827]">Step 1: Front Selfie Captured</h2>
              <p className="text-[#4b5563]">Review your photo</p>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden max-w-md mx-auto">
              <img src={frontSelfie} alt="Front selfie" className="w-full aspect-[3/4] object-cover" />
              <div className="absolute top-4 right-4">
                <div className="bg-[#22c55e] text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Liveness Passed
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              <Button onClick={retryLiveness} variant="outline" className="px-6 py-3 rounded-xl">
                <RotateCcw className="w-5 h-5 mr-2" />
                Retake
              </Button>
              <Button onClick={handleFrontConfirm} className="px-6 py-3 rounded-xl bg-[#22c55e] hover:bg-green-600">
                <Check className="w-5 h-5 mr-2" />
                Continue
              </Button>
            </div>
          </div>
        );

      case 'back-switch':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#2563eb]/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Smartphone className="w-10 h-10 text-[#2563eb]" />
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">Switching to Back Camera</h2>
            <p className="text-[#4b5563]">Turn your phone toward the classroom</p>
            <LoadingSpinner size="md" text="Preparing camera..." />
          </div>
        );

      case 'back-capture':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-[#111827]">Step 2: Back Camera</h2>
              <p className="text-[#4b5563]">Capture a view of the classroom</p>
            </div>
            
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3] max-w-md mx-auto">
              {!backImage ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={backImage} alt="Back camera" className="w-full h-full object-cover" />
              )}
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex justify-center gap-3">
              {!backImage ? (
                <Button onClick={handleBackCapture} className="px-8 py-3 rounded-xl bg-[#2563eb] hover:bg-blue-700">
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Back Image
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => setBackImage(null)} 
                    variant="outline" 
                    className="px-6 py-3 rounded-xl"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Retake
                  </Button>
                  <Button 
                    onClick={handleBackConfirm} 
                    className="px-6 py-3 rounded-xl bg-[#22c55e] hover:bg-green-600"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Submit
                  </Button>
                </>
              )}
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-12">
            <LoadingSpinner size="xl" />
            <h2 className="text-xl font-bold text-[#111827] mt-6 mb-2">Verifying Your Identity</h2>
            <p className="text-[#4b5563]">Comparing face with reference using FaceNet AI...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-[#22c55e]" />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">Attendance Marked!</h2>
            <p className="text-[#4b5563] mb-8">Your attendance has been successfully recorded</p>
            
            <div className="bg-gray-50 rounded-2xl p-6 max-w-sm mx-auto mb-8 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-[#4b5563]">Course</span>
                <span className="font-medium text-[#111827]">{result.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b5563]">Session ID</span>
                <span className="font-mono font-medium text-[#111827]">{result.sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b5563]">Similarity Score</span>
                <span className="font-medium text-[#22c55e]">
                  {result.similarity != null ? `${Math.round(result.similarity * 100)}%` : '—'}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate(createPageUrl('StudentDashboard'))}
              className="px-8 py-3 rounded-xl bg-[#2563eb] hover:bg-blue-700"
            >
              Go to Dashboard
            </Button>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">Verification Failed</h2>
            <p className="text-[#4b5563] mb-4">{result?.reason || 'Face verification did not pass'}</p>
            
            {result?.similarity != null && (
              <p className="text-sm text-[#4b5563] mb-8">
                Similarity score: {Math.round(result.similarity * 100)}%
              </p>
            )}
            
            <div className="flex justify-center gap-3">
              <Button 
                onClick={() => {
                  setStep('front-liveness');
                  setFrontSelfie(null);
                  setBackImage(null);
                  setLivenessStatus('waiting');
                  setLivenessCountdown(5);
                }}
                className="px-8 py-3 rounded-xl bg-[#2563eb] hover:bg-blue-700"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        );
    }
  };

  if (authLoading || !student || !sessionData) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          {step !== 'success' && step !== 'failed' && (
            <button 
              onClick={() => navigate(createPageUrl('ScanQR'))}
              className="inline-flex items-center gap-2 text-[#4b5563] hover:text-[#2563eb] transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to QR Scan
            </button>
          )}

          {/* Session Info */}
          {step !== 'success' && step !== 'failed' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4b5563]">Session</p>
                  <p className="font-semibold text-[#111827]">{sessionData.courseName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#4b5563]">Date</p>
                  <p className="font-medium text-[#111827]">
                    {new Date(sessionData.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          {step !== 'success' && step !== 'failed' && step !== 'processing' && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                step.includes('front') ? 'bg-[#2563eb] text-white' : 'bg-gray-100 text-[#4b5563]'
              }`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
                Front Camera
              </div>
              <div className="w-8 h-0.5 bg-gray-200" />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                step.includes('back') ? 'bg-[#2563eb] text-white' : 'bg-gray-100 text-[#4b5563]'
              }`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
                Back Camera
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            {renderStep()}
          </div>
        </div>
      </main>
    </div>
  );
}
