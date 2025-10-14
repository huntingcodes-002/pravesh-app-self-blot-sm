'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MOCK_OTP } from '@/lib/mock-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { CircleCheck, Lock, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OtpVerificationPage() {
  const router = useRouter();
  const { pendingAuth, verifyOtpAndSignIn } = useAuth();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Redirect if no pending auth data
  useEffect(() => {
    if (!pendingAuth) {
      router.replace('/dashboard');
    }
  }, [pendingAuth, router]);

  // Resend Timer Logic
  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter the 6-digit OTP.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const success = await verifyOtpAndSignIn(otp);
    
    if (success) {
      toast({
        title: 'Verification Successful',
        description: 'Mobile number verified. Redirecting to Home Dashboard.',
        className: 'bg-green-50 border-green-200',
        action: <CircleCheck className='h-4 w-4'/>
      });
      
      // Redirect to the Home Dashboard
      router.replace('/dashboard'); 
    } else {
      toast({
        title: 'Verification Failed',
        description: 'The OTP entered is incorrect. Please try again.',
        variant: 'destructive',
      });
      setOtp(''); // Clear OTP on failure
    }
    setIsVerifying(false);
  };
  
  const handleResend = () => {
    setResendTimer(60); // Reset timer to 60 seconds
    toast({
      title: 'OTP Resent',
      description: 'A new OTP has been sent to your registered mobile number.',
      className: 'bg-blue-50 border-blue-200',
      action: <RotateCcw className='h-4 w-4'/>
    });
  };

  if (!pendingAuth) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Lock className="w-10 h-10 text-green-600 mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold">OTP Verification</CardTitle>
          <CardDescription>
            A 6-digit code has been sent to your registered mobile number:<br/>
            <span className='font-semibold text-gray-800'>{pendingAuth.user.phone}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP 
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <Button 
              type="submit" 
              className={cn("w-full h-12 bg-green-600 hover:bg-green-700 font-semibold", isVerifying && 'opacity-70')}
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
            
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>
                {resendTimer > 0 
                  ? `Resend OTP in ${resendTimer} seconds` 
                  : 'Did not receive the code?'}
              </p>
              <Button 
                type="button" 
                variant="link" 
                onClick={handleResend} 
                disabled={resendTimer > 0 || isVerifying}
                className={cn('p-0 h-auto', (resendTimer > 0 || isVerifying) && 'cursor-not-allowed text-gray-400')}
              >
                Resend
              </Button>
            </div>
            
            <div className="text-center text-xs text-blue-500">
                <p>For testing, use the mock OTP: <span className="font-semibold">{MOCK_OTP}</span></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
