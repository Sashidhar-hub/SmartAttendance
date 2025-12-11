// src/utils.js

export function createPageUrl(pageName) {
  switch (pageName) {
    case 'Landing':
      return '/'
    case 'StudentLogin':
      return '/login'
    case 'StudentSignup':
      return '/signup'
    case 'SetupFace':
      return '/setup-face'
    case 'StudentDashboard':
      return '/dashboard'
    case 'ScanQR':
      return '/scan-qr'
    case 'VerifyFace':
      return '/verify-face'
    case 'AttendanceHistory':
      return '/history'
    default:
      return '/'
  }
}