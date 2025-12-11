import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { UserPlus, LogIn, Fingerprint, Shield, Zap, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StepGuide from '@/components/common/StepGuide';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2563eb]/10 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-[#22c55e]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-24">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#2563eb] to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Fingerprint className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#111827]">Smart AI Attendance</h1>
                <p className="text-sm text-[#4b5563]">Student Portal</p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2563eb] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Verification
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-[#111827] mb-6 leading-tight">
              Face + Liveness
              <span className="block bg-gradient-to-r from-[#2563eb] to-blue-600 bg-clip-text text-transparent">
                Powered Attendance
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-[#4b5563] mb-10 max-w-2xl mx-auto leading-relaxed">
              Mark your attendance securely using facial recognition and liveness detection. 
              No proxies, no fraud — just you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={createPageUrl('StudentSignup')}>
                <Button className="w-full sm:w-auto px-8 py-6 text-lg rounded-2xl bg-[#2563eb] hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Student Signup
                </Button>
              </Link>
              <Link to={createPageUrl('StudentLogin')}>
                <Button variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg rounded-2xl border-2 hover:bg-gray-50 transition-all duration-300 hover:-translate-y-1">
                  <LogIn className="w-5 h-5 mr-2" />
                  Student Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Step Guide */}
          <div className="mb-16">
            <p className="text-center text-[#4b5563] mb-8 font-medium">How it works</p>
            <StepGuide />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Fingerprint,
                title: 'FaceNet Recognition',
                description: 'Advanced AI matches your face with 99.6% accuracy'
              },
              {
                icon: Shield,
                title: 'Liveness Detection',
                description: 'Mediapipe ensures you are physically present, not a photo'
              },
              {
                icon: Smartphone,
                title: 'Dual Camera Capture',
                description: 'Front selfie + back camera for complete verification'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#2563eb]" />
                </div>
                <h3 className="font-semibold text-[#111827] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#4b5563]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-[#4b5563]">
            © {new Date().getFullYear()} Smart AI Attendance. Secure and reliable.
          </p>
        </div>
      </footer>
    </div>
  );
}