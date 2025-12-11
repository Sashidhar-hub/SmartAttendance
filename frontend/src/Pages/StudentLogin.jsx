// src/Pages/StudentLogin.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { LogIn, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthContext';

// --- Simple local UI components (so no missing imports) ---

const Button = ({ className = "", children, ...props }) => (
  <button
    className={
      "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium " +
      "bg-[#2563eb] text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed " +
      "shadow-lg shadow-blue-500/30 transition-all duration-300 " +
      className
    }
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={
      "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none " +
      "focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] " +
      className
    }
    {...props}
  />
);

const Label = ({ className = "", children, ...props }) => (
  <label
    className={"block text-sm font-medium text-[#111827] " + className}
    {...props}
  >
    {children}
  </label>
);

// --- Page component ---

export default function StudentLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) newErrors.identifier = 'Student ID or Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await api.login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      // expected backend returns { success, student, token } or { student, token }
      const { student, token } = res.student ? res : res.data || {};
      if (!student || !token) throw new Error('Invalid login response');

      // save in context + localStorage
      login(student, token);
      toast.success('Login successful!');

      if (!student.hasReferenceFace) {
        navigate(createPageUrl('SetupFace'));
      } else {
        navigate(createPageUrl('StudentDashboard'));
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err?.message ||
        err?.message?.message ||
        err?.error ||
        err?.data?.message ||
        'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] py-8 px-4 flex items-center justify-center">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2563eb]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -left-40 w-80 h-80 bg-[#22c55e]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back button */}
        <Link
          to={createPageUrl('Landing')}
          className="inline-flex items-center gap-2 text-[#4b5563] hover:text-[#2563eb] transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2563eb] to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#111827]">Welcome Back</h1>
            <p className="text-[#4b5563] mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="identifier" className="text-[#111827] font-medium">
                Student ID or Email
              </Label>
              <Input
                id="identifier"
                value={formData.identifier}
                onChange={handleChange('identifier')}
                placeholder="STU2024001 or john@university.edu"
                className={`mt-1.5 h-12 rounded-xl border-gray-200 focus:border-[#2563eb] focus:ring-[#2563eb] ${
                  errors.identifier ? 'border-red-500' : ''
                }`}
              />
              {errors.identifier && (
                <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-[#111827] font-medium">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  placeholder="••••••••"
                  className={`h-12 rounded-xl border-gray-200 focus:border-[#2563eb] focus:ring-[#2563eb] pr-12 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#111827]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-[#4b5563] mt-6">
            Don't have an account?{' '}
            <Link
              to={createPageUrl('StudentSignup')}
              className="text-[#2563eb] font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
