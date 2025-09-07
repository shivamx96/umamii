'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailOtp, verifyEmailOtp, signInWithMagicLink } from '@/lib/backend';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";


export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'method' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [, setAuthMethod] = useState<'magic_link' | 'otp' | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0 && step === 'otp') {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStep('method');
  };

  const handleMethodSelect = async (method: 'magic_link' | 'otp') => {
    setIsLoading(true);
    setError('');
    setAuthMethod(method);
    
    try {
      if (method === 'magic_link') {
        await signInWithMagicLink(email);
        setError('Check your email for the magic link to sign in!');
      } else {
        await signInWithEmailOtp(email);
        setStep('otp');
        setResendTimer(60);
        setCanResend(false);
      }
    } catch (err: unknown) {
      console.log(err);
      setError(err instanceof Error ? err.message : 'Failed to send authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await verifyEmailOtp(email, otpString);
      
      if (result.user) {
        // Check if user has completed profile setup
        const { getCurrentProfile } = await import('@/lib/backend');
        const profile = await getCurrentProfile();
        
        if (profile && profile.name && profile.username) {
          router.push('/dashboard');
        } else {
          router.push('/auth/profile-setup');
        }
      }
    } catch (err: unknown) {
      console.log(err);
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithEmailOtp(email);
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err: unknown) {
      console.log(err);
      setError(err instanceof Error ? err.message : 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-6">
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">
              {step === 'email' ? 'Enter your email' : 
               step === 'method' ? 'Choose sign-in method' : 'Verify your email'}
            </h1>
            <p className="text-gray-600">
              {step === 'email' 
                ? 'We\'ll send you a verification code or magic link' 
                : step === 'method'
                ? 'How would you like to sign in?'
                : `We've sent a 6-digit code to ${email}`
              }
            </p>
          </div>

          {/* Email Form */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Continue
              </button>
            </form>
          )}

          {/* Method Selection */}
          {step === 'method' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <button
                  onClick={() => handleMethodSelect('magic_link')}
                  disabled={isLoading}
                  className="w-full p-4 border-2 border-gray-200 hover:border-orange-500 rounded-xl text-left transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Magic Link</h3>
                      <p className="text-sm text-gray-600">Sign in with one click from your email</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleMethodSelect('otp')}
                  disabled={isLoading}
                  className="w-full p-4 border-2 border-gray-200 hover:border-orange-500 rounded-xl text-left transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Email OTP</h3>
                      <p className="text-sm text-gray-600">Enter a 6-digit code sent to your email</p>
                    </div>
                  </div>
                </button>
              </div>

              {error && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-600">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-gray-600 hover:text-gray-800 font-medium py-3 transition-colors"
              >
                ← Change Email
              </button>
            </div>
          )}

          {/* OTP Verification Form */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* OTP Input */}
                <div>
                  <Label className="text-sm font-medium mb-2">Enter 6-digit code</Label>
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        className="text-center text-xl font-bold w-12 h-12"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Timer */}
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-gray-600">
                      Resend code in {resendTimer}s
                    </p>
                  ) : canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                    >
                      Resend Code
                    </button>
                  ) : null}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('method')}
                className="w-full text-gray-600 hover:text-gray-800 font-medium py-3 transition-colors"
              >
                ← Change Method
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}