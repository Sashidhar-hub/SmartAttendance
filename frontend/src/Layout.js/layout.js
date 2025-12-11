import React from 'react';
import { AuthProvider } from '@/components/auth/AuthContext';
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f9fafb]">
        {children}
        <Toaster 
          position="top-center" 
          richColors 
          toastOptions={{
            style: {
              borderRadius: '12px',
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}