'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const countryCodes = [
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
];

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[1]); // Default to India
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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('otp');
      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      console.log(err);
      setError('Failed to send OTP. Please try again.');
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/auth/profile-setup');
    } catch (err) {
      console.log(err);
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
      console.log(err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-6">
      <div className="max-w-md mx-auto w-full">
        <Card className="p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {step === 'phone' ? 'Enter your phone number' : 'Verify your phone'}
            </h1>
            <p className="text-muted-foreground">
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
                  <Label className="text-sm font-medium mb-2">Country</Label>
                  <Select value={selectedCountry.code} onValueChange={(value) => {
                    const country = countryCodes.find(c => c.code === value);
                    if (country) setSelectedCountry(country);
                  }}>
                    <SelectTrigger>
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
                  <Label className="text-sm font-medium mb-2">Phone Number</Label>
                  <div className="flex space-x-3">
                    <div className="flex items-center px-4 py-3 bg-muted rounded-xl min-w-[80px]">
                      <span className="font-medium">
                        {selectedCountry.flag} {selectedCountry.code}
                      </span>
                    </div>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234567890"
                      maxLength={15}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Card className="p-3 bg-destructive/10 border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </Card>
              )}

              <Button
                type="submit"
                disabled={isLoading || !phoneNumber}
                size="lg"
                className="w-full"
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
                    <p className="text-sm text-muted-foreground">
                      Resend code in {resendTimer}s
                    </p>
                  ) : canResend ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-primary hover:text-primary/90"
                    >
                      Resend Code
                    </Button>
                  ) : null}
                </div>
              </div>

              {error && (
                <Card className="p-3 bg-destructive/10 border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </Card>
              )}

              <Button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('phone')}
                className="w-full"
              >
                ← Change Phone Number
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}