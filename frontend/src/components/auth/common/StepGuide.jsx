import React from 'react';
import { UserPlus, Camera, QrCode, CheckCircle } from 'lucide-react';

const steps = [
  { icon: UserPlus, label: 'Signup', description: 'Create your account' },
  { icon: Camera, label: 'Face Setup', description: 'Register your face' },
  { icon: QrCode, label: 'Scan QR', description: 'Scan session code' },
  { icon: CheckCircle, label: 'Marked', description: 'Attendance done' }
];

export default function StepGuide() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
          >
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
              {index + 1}
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#2563eb] transition-colors duration-300">
                <step.icon className="w-7 h-7 text-[#2563eb] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-[#111827] mb-1">{step.label}</h3>
              <p className="text-xs text-[#4b5563]">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}