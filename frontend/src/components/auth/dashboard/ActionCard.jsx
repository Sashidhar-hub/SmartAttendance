import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';

export default function ActionCard({ icon: Icon, title, description, page, gradient }) {
  return (
    <Link
      to={createPageUrl(page)}
      className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${gradient}`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#111827] text-lg">{title}</h3>
            <p className="text-sm text-[#4b5563]">{description}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#4b5563] group-hover:translate-x-1 group-hover:text-[#2563eb] transition-all duration-300" />
      </div>
    </Link>
  );
}