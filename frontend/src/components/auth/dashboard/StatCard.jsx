import React from 'react';

export default function StatCard({ icon: Icon, label, value, color = 'blue', subtitle }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-[#2563eb]',
    green: 'bg-green-50 text-[#22c55e]',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#4b5563] mb-1">{label}</p>
          <p className="text-3xl font-bold text-[#111827]">{value}</p>
          {subtitle && <p className="text-xs text-[#4b5563] mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}