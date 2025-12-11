// src/Pages/StudentSignup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
// swapped base44 for the real API client
import { api } from '@/api/apiClient';
import { UserPlus, ArrowLeft, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function StudentSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    classSection: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.classSection.trim()) newErrors.classSection = 'Class/Section is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // call the real backend signup endpoint
      // backend will handle duplicate check and hashing
      const payload = {
        studentId: formData.studentId,
        name: formData.name,
        email: formData.email,
        classSection: formData.classSection,
        password: formData.password
      };

      await api.signup(payload);

      toast.success('Account created successfully! Please login.');
      navigate(createPageUrl('StudentLogin'));
      
    } catch (error) {
      console.error('Signup error:', error);

      // if backend returned a friendly message, show it
      const msg = (error && (error.message || (error.body && (error.body.message || error.body.msg)))) || 'Failed to create account. Please try again.';
      toast.error(msg);

      // surface specific validation errors locally when possible
      if (error.status === 400 && msg.toLowerCase().includes('already')) {
        setErrors({ studentId: 'This Student ID is already registered' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] py-8 px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2563eb]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -left-40 w-80 h-80 bg-[#22c55e]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto">
        {/* Back button */}
        <Link 
          to={createPageUrl('Landing')}
          className="inline-flex items-center gap-2 text-[#4b5563] hover:text-[#2563eb] transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        {/* Signup Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2563eb] to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#111827]">Create Account</h1>
            <p className="text-[#4b5563] mt-1">Join Smart AI Attendance</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-[#111827] font-medium">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="John Doe"
                className={`mt-1.5 h-12 rounded-xl border-gray-200 focus:border-[#2563eb] focus:ring-[#2563eb] ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="studentId" className="text-[#111827] font-medium">Student ID</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={handleChange('studentId')}
                placeholder="STU2024001"
                className={`mt-1.5 h-12 rounded-xl border-gray-200 focus:border-[#2563eb] focus:ring-[#2563eb] ${errors.studentId ? 'border-red-500' : ''}`}
              />
              {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-[#111827] font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="john@university.edu"
                className={`mt-1.5 h-12 rounded-xl border-gray-200 focus:border-[#2563eb] focus:ring-[#2563eb] ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="classSection" className="text-[#111827] font-medium">Class / Section</Label>
              <Input
                id="classSection"
                value={formData.classSection}
                onChange={handleChange('classSection')}
                placeholder="CS-2024-A"
                className={`mt-1.5 h-12 rounded-xl border-gray-200 focus:border-[#2563eb] focus:ring-[#2563eb] ${errors.classSection ? 'border-red-500' : ''}`}
              />
              {errors.classSection && <p className="text-red-500 text-xs mt-1">{errors.classSection}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-[#111827] font-medium">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  placeholder="••••••••"
                  className={`h-12 rounded-xl border-gray-200 focus:border-[#2563eb] focus:ring-[#2563eb] pr-12 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#111827]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-[#111827] font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="••••••••"
                className={`mt-1.5 h-12 rounded-xl border-gray-200 focus:border-[#2563eb] focus:ring-[#2563eb] ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-[#4b5563] mt-6">
            Already have an account?{' '}
            <Link to={createPageUrl('StudentLogin')} className="text-[#2563eb] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
