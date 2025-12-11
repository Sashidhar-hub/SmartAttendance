// inside SetupFace component file (import api & useAuth at top)
import { api } from '@/api/apiClient';
import { useAuth } from '@/components/auth/AuthContext';

// ... in component:
const handleSave = async () => {
  setStep('processing');
  setIsProcessing(true);
  setError(null);

  try {
    // Simulate embedding if you still want client-side embedding; 
    // Ideally compute embedding on AI server and send to backend. For now send photo.
    // We'll send photoBase64 and let backend/AI extract embedding later.
    await api.registerFace({
      studentId: student.studentId,
      photoBase64: capturedImage,
      // optionally include faceEmbedding if you generate it here
    });

    // update local auth state
    updateStudent({
      photoBase64: capturedImage,
      hasReferenceFace: true
      // faceEmbedding: mockEmbedding // if available
    });

    toast.success('Face registered successfully!');
    setStep('success');
  } catch (err) {
    console.error('Face setup error:', err);
    toast.error(err.message || 'Failed to save face data. Please try again.');
    setStep('preview');
  } finally {
    setIsProcessing(false);
  }
};
