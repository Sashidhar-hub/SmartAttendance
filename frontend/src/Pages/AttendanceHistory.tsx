import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  ArrowLeft, Calendar, TrendingUp, CheckCircle, 
  Clock, ChevronRight, Filter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/common/Navbar';
import StatCard from '@/components/dashboard/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/components/auth/AuthContext';

export default function AttendanceHistory() {
  const navigate = useNavigate();
  const { student, loading: authLoading } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, this-month, last-month
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    overallPercentage: 0,
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
      }, '-date', 200);
      
      setAttendance(records);
      calculateStats(records);
      
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    const now = new Date();
    const thisMonth = records.filter(r => {
      const date = new Date(r.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    
    const lastMonth = records.filter(r => {
      const date = new Date(r.date);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    });

    // Assume average 20 classes per month
    const monthExpected = 20;
    const dayOfMonth = now.getDate();
    const expectedSoFar = Math.ceil((dayOfMonth / 30) * monthExpected);

    setStats({
      total: records.length,
      thisMonth: thisMonth.length,
      lastMonth: lastMonth.length,
      overallPercentage: records.length > 0 ? Math.round((records.length / Math.max(monthExpected * 3, records.length)) * 100) : 0,
      monthPercentage: expectedSoFar > 0 ? Math.min(100, Math.round((thisMonth.length / expectedSoFar) * 100)) : 0
    });
  };

  const getFilteredRecords = () => {
    const now = new Date();
    
    switch (filter) {
      case 'this-month':
        return attendance.filter(r => {
          const date = new Date(r.date);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
      case 'last-month':
        return attendance.filter(r => {
          const date = new Date(r.date);
          const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
        });
      default:
        return attendance;
    }
  };

  const groupByDate = (records) => {
    const groups = {};
    records.forEach(record => {
      const date = record.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
    });
    return groups;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading attendance history..." />
      </div>
    );
  }

  if (!student) return null;

  const filteredRecords = getFilteredRecords();
  const groupedRecords = groupByDate(filteredRecords);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button 
            onClick={() => navigate(createPageUrl('StudentDashboard'))}
            className="inline-flex items-center gap-2 text-[#4b5563] hover:text-[#2563eb] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">Attendance History</h1>
              <p className="text-[#4b5563]">View your complete attendance record</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Calendar}
              label="Total Classes"
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={Calendar}
              label="This Month"
              value={stats.thisMonth}
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              label="Overall Rate"
              value={`${stats.overallPercentage}%`}
              color="purple"
            />
            <StatCard
              icon={TrendingUp}
              label="Monthly Rate"
              value={`${stats.monthPercentage}%`}
              color="orange"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'All Time' },
              { value: 'this-month', label: 'This Month' },
              { value: 'last-month', label: 'Last Month' }
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.value
                    ? 'bg-[#2563eb] text-white'
                    : 'bg-white text-[#4b5563] border border-gray-200 hover:border-[#2563eb] hover:text-[#2563eb]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Attendance Records */}
          {Object.keys(groupedRecords).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedRecords).map(([date, records]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-[#4b5563] mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {records.map((record) => (
                        <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#22c55e]/10 rounded-xl flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-[#22c55e]" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#111827]">{record.courseName}</p>
                              <div className="flex items-center gap-2 text-sm text-[#4b5563] mt-1">
                                <Clock className="w-4 h-4" />
                                {record.timestamp ? new Date(record.timestamp).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit'
                                }) : 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#22c55e]/10 text-[#22c55e]">
                              Present
                            </span>
                            <p className="text-sm text-[#4b5563] mt-1">
                              {Math.round(record.similarity * 100)}% match
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#111827] mb-2">No Records Found</h3>
              <p className="text-[#4b5563]">
                {filter === 'all' 
                  ? "You haven't marked any attendance yet." 
                  : `No attendance records for ${filter === 'this-month' ? 'this month' : 'last month'}.`}
              </p>
              <Button 
                onClick={() => navigate(createPageUrl('ScanQR'))}
                className="mt-6 px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-blue-700"
              >
                Mark Attendance
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}