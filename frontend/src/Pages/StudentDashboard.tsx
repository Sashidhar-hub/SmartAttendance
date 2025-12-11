import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { QrCode, History, Calendar, TrendingUp, User } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import StatCard from '@/components/dashboard/StatCard';
import ActionCard from '@/components/dashboard/ActionCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/components/auth/AuthContext';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { student, loading: authLoading } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    percentage: 0,
    monthPercentage: 0
  });

  useEffect(() => {
    if (!authLoading && !student) {
      navigate(createPageUrl('StudentLogin'));
    }
  }, [student, authLoading, navigate]);

  useEffect(() => {
    if (student) {
      fetchAttendance();
    }
  }, [student]);

  const fetchAttendance = async () => {
    try {
      const records = await base44.entities.Attendance.filter({ 
        studentId: student.studentId 
      }, '-created_date', 100);
      
      setAttendance(records);
      
      // Calculate stats
      const now = new Date();
      const thisMonth = records.filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });

      // Assume 20 classes per month as baseline
      const totalExpected = 20;
      const monthExpected = Math.ceil((now.getDate() / 30) * 20);

      setStats({
        total: records.length,
        thisMonth: thisMonth.length,
        percentage: Math.round((records.length / Math.max(totalExpected, records.length)) * 100),
        monthPercentage: monthExpected > 0 ? Math.round((thisMonth.length / monthExpected) * 100) : 0
      });
      
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#2563eb] to-blue-700 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
            </div>
            
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  {student.photoBase64 ? (
                    <img 
                      src={student.photoBase64} 
                      alt={student.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Welcome back,</p>
                  <h1 className="text-2xl md:text-3xl font-bold">{student.name}</h1>
                  <p className="text-blue-200 text-sm mt-1">
                    {student.studentId} • {student.classSection}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <p className="text-blue-100 text-sm">This Month</p>
                  <p className="text-3xl font-bold">{stats.monthPercentage}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Calendar}
              label="Total Classes"
              value={stats.total}
              color="blue"
              subtitle="All time"
            />
            <StatCard
              icon={Calendar}
              label="This Month"
              value={stats.thisMonth}
              color="green"
              subtitle="Classes attended"
            />
            <StatCard
              icon={TrendingUp}
              label="Overall Rate"
              value={`${stats.percentage}%`}
              color="purple"
              subtitle="Attendance"
            />
            <StatCard
              icon={TrendingUp}
              label="Monthly Rate"
              value={`${stats.monthPercentage}%`}
              color="orange"
              subtitle="This month"
            />
          </div>

          {/* Action Cards */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#111827]">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <ActionCard
                icon={QrCode}
                title="Mark Attendance"
                description="Scan QR code to mark your attendance"
                page="ScanQR"
                gradient="bg-gradient-to-br from-[#2563eb] to-blue-700"
              />
              <ActionCard
                icon={History}
                title="Attendance History"
                description="View your complete attendance record"
                page="AttendanceHistory"
                gradient="bg-gradient-to-br from-[#22c55e] to-green-600"
              />
            </div>
          </div>

          {/* Recent Attendance */}
          {attendance.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-[#111827] mb-4">Recent Attendance</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {attendance.slice(0, 5).map((record) => (
                    <div key={record.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#22c55e]/10 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#22c55e]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#111827]">{record.courseName}</p>
                          <p className="text-sm text-[#4b5563]">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#22c55e]/10 text-[#22c55e]">
                          Present
                        </span>
                        <p className="text-xs text-[#4b5563] mt-1">
                          {Math.round(record.similarity * 100)}% match
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}