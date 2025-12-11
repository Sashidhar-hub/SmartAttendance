import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, QrCode, Calendar, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/common/Navbar';
import QRScanner from '@/components/scanner/QRScanner';
import { useAuth } from '@/components/auth/AuthContext';

export default function ScanQR() {
  const navigate = useNavigate();
  const { student, loading } = useAuth();
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    if (!loading && !student) {
      navigate(createPageUrl('StudentLogin'));
    }
  }, [student, loading, navigate]);

  const handleScan = (data) => {
    setScannedData(data);
  };

  const handleContinue = () => {
    const params = new URLSearchParams({
      sessionId: scannedData.sessionId,
      courseName: scannedData.courseName,
      date: scannedData.date
    });
    navigate(`${createPageUrl('VerifyFace')}?${params.toString()}`);
  };

  if (loading || !student) return null;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <button 
            onClick={() => navigate(createPageUrl('StudentDashboard'))}
            className="inline-flex items-center gap-2 text-[#4b5563] hover:text-[#2563eb] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2563eb] to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#111827]">Scan Session QR</h1>
            <p className="text-[#4b5563] mt-1">Scan the QR code displayed in your classroom</p>
          </div>

          {!scannedData ? (
            <QRScanner onScan={handleScan} />
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-[#22c55e]" />
                </div>
                <h2 className="text-xl font-bold text-[#111827]">Session Found!</h2>
                <p className="text-[#4b5563] mt-1">Verify details and continue</p>
              </div>

              {/* Session Details Card */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2563eb]/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#2563eb]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#4b5563]">Course</p>
                    <p className="font-semibold text-[#111827]">{scannedData.courseName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#22c55e]/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#22c55e]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#4b5563]">Date</p>
                    <p className="font-semibold text-[#111827]">
                      {new Date(scannedData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[#4b5563]">Session ID</p>
                    <p className="font-mono font-semibold text-[#111827]">{scannedData.sessionId}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setScannedData(null)}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  Scan Again
                </Button>
                <Button
                  onClick={handleContinue}
                  className="flex-1 h-12 rounded-xl bg-[#2563eb] hover:bg-blue-700"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 bg-blue-50 rounded-2xl p-4">
            <p className="text-sm text-[#2563eb] font-medium mb-2">💡 Tips</p>
            <ul className="text-sm text-[#4b5563] space-y-1">
              <li>• Hold your phone steady while scanning</li>
              <li>• Ensure the QR code is well-lit</li>
              <li>• Keep the entire QR code within the frame</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}