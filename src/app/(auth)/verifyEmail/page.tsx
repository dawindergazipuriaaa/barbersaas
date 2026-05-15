'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

const VerifyEmailContent = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Grab the ?token=... from the URL
  const token = searchParams.get('token');

  useEffect(() => {
    // If someone visits the page without a token in the URL
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        // Send the token to your backend API to check if it is valid
        // (Make sure you actually have a POST route at /api/auth/verify-email)
        await axios.post('/api/auth/verify-email', { token });
        
        setStatus('success');
        setMessage('Your email has been successfully verified!');
      } catch (error: any) {
        setStatus('error');
        if (axios.isAxiosError(error)) {
          setMessage(error.response?.data?.error || 'Verification failed. Your token may have expired.');
        } else {
          setMessage('An unexpected error occurred.');
        }
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex flex-col border-2 border-white/40 gap-5 items-center my-10 p-10 w-full max-w-md bg-neutral-800 rounded-lg shadow-xl">
      <div className="text-3xl items-center flex flex-col font-bold tracking-widest text-white text-center">
        Email Verification
      </div>
      
      <div className="mt-5 mb-5 text-center text-lg tracking-wider">
        {status === 'loading' && (
          <p className="text-yellow-400 animate-pulse">{message}</p>
        )}
        {status === 'success' && (
          <p className="text-green-400 font-semibold">{message}</p>
        )}
        {status === 'error' && (
          <p className="text-red-400 font-semibold">{message}</p>
        )}
      </div>

      {status !== 'loading' && (
        <button 
          onClick={() => router.push('/login')}
          className="self-center px-10 active:scale-95 mt-4 py-2 bg-goldenbg rounded-4xl text-xl tracking-wider hover:cursor-pointer transition-transform"
        >
          Go to Login
        </button>
      )}
    </div>
  );
};

const VerifyEmailPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-neutral-900'>
      {/* Next.js requires useSearchParams to be wrapped in a Suspense boundary 
        to prevent build errors during deployment. 
      */}
      <Suspense fallback={<div className="text-white text-xl animate-pulse">Loading verification...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
};

export default VerifyEmailPage;