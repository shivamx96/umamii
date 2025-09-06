'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
];

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[1]); // Default to India
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [step, resendTimer]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('otp');
      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      setError('Please enter the complete OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/auth/profile-setup');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-6 flex flex-col justify-center">
      <div className="content-container">
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-2xl p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
              {step === 'phone' ? 'Enter your phone number' : 'Verify your phone'}
            </h1>
            <p className="text-white/80 drop-shadow-md">
              {step === 'phone' 
                ? 'We\'ll send you a verification code' 
                : `We've sent a 6-digit code to ${selectedCountry.code} ${phoneNumber}`
              }
            </p>
          </div>

          {/* Phone Number Form */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Country Code Selector */}
              <div>
                <label className="block text-sm font-medium text-white drop-shadow-md mb-2">
                  Country
                </label>
                <Select value={selectedCountry.code} onValueChange={(value) => {
                  const country = countryCodes.find(c => c.code === value);
                  if (country) setSelectedCountry(country);
                }}>
                  <SelectTrigger className="bg-input/80 backdrop-blur-md border-border/50 text-white">
                    <SelectValue>
                      {selectedCountry.flag} {selectedCountry.code} {selectedCountry.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.code} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-white drop-shadow-md mb-2">
                  Phone Number
                </label>
                <div className="flex space-x-3">
                  <div className="flex items-center px-4 py-3 bg-card/50 backdrop-blur-md border border-border/50 rounded-xl min-w-[80px]">
                    <span className="text-white font-medium">
                      {selectedCountry.flag} {selectedCountry.code}
                    </span>
                  </div>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234567890"
                    maxLength={15}
                    className="flex-1 bg-input/80 backdrop-blur-md border-border/50 text-white placeholder-white/70 focus:ring-ring focus:border-ring"
                  />
                </div>
              </div>
            </div>

            {error && (
              <Card className="p-3 bg-destructive/20 backdrop-blur-md border-destructive/50">
                <p className="text-sm text-white drop-shadow-sm">{error}</p>
              </Card>
            )}

            <Button
              type="submit"
              disabled={isLoading || !phoneNumber}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending OTP...</span>
                </div>
              ) : (
                'Send OTP'
              )}
            </Button>
            </form>
          )}

          {/* OTP Verification Form */}
          {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-white drop-shadow-md mb-3">
                  Enter 6-digit code
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold bg-input/80 backdrop-blur-md border border-border/50 rounded-xl focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 text-white"
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                {canResend ? (
                  <Button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    variant="ghost"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Resend OTP
                  </Button>
                ) : (
                  <p className="text-white/70 text-sm drop-shadow-sm">
                    Resend OTP in {resendTimer}s
                  </p>
                )}
              </div>
            </div>

            {error && (
              <Card className="p-3 bg-destructive/20 backdrop-blur-md border-destructive/50">
                <p className="text-sm text-white drop-shadow-sm">{error}</p>
              </Card>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isLoading || otp.some(digit => !digit)}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              <Button
                type="button"
                onClick={() => setStep('phone')}
                variant="ghost"
                className="w-full text-white/70 hover:text-white font-medium bg-card/30 backdrop-blur-md hover:bg-card/50 transition-colors duration-200"
              >
                Change Phone Number
              </Button>
            </div>
          </form>
          )}
        </Card>

      </div>
    </div>
  );
}