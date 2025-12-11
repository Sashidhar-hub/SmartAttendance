import React from 'react';

export default function FaceGuideOverlay({ showInstructions = true, instruction = '' }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Oval face guide */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-80">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-[50%] border-4 border-[#2563eb]/30 animate-pulse" />
          {/* Inner guide */}
          <div className="absolute inset-2 rounded-[50%] border-2 border-[#2563eb] border-dashed" />
          {/* Corner markers */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#2563eb] rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#2563eb] rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2563eb] rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2563eb] rounded-full" />
        </div>
      </div>

      {/* Instruction text */}
      {showInstructions && instruction && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="bg-black/70 text-white px-6 py-3 rounded-2xl text-sm font-medium backdrop-blur-sm">
            {instruction}
          </div>
        </div>
      )}
    </div>
  );
}