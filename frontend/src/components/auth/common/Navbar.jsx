import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, QrCode, History, LogOut, User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { student, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = createPageUrl('Landing');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', page: 'StudentDashboard' },
    { icon: QrCode, label: 'Mark Attendance', page: 'ScanQR' },
    { icon: History, label: 'History', page: 'AttendanceHistory' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={createPageUrl('StudentDashboard')} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#2563eb] to-blue-700 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#111827] hidden sm:block">Smart AI Attendance</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#4b5563] hover:bg-blue-50 hover:text-[#2563eb] transition-all duration-200"
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden md:block text-sm font-medium">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 ml-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:block text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}