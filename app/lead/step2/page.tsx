'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Send, Loader } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added Select
import { MOCK_OTP } from '@/lib/mock-auth';
import { cn } from '@/lib/utils';

export default function Step2Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    countryCode: currentLead?.formData?.step2?.countryCode || '+91',
    mobile: currentLead?.customerMobile || '',
    salutation: currentLead?.formData?.step2?.salutation || 'Mr',
    firstName: currentLead?.customerFirstName || '',
    lastName: currentLead?.customerLastName || '',
  });
  const [isMobileVerified, setIsMobileVerified] = useState(currentLead?.formData?.step2?.isMobileVerified || false);
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(isMobileVerified ? false : (currentLead?.formData?.step2?.otpSent || false));

  useEffect(() => {
    // Sync state from context on load
    if (currentLead?.formData?.step2) {
      setIsMobileVerified(currentLead.formData.step2.isMobileVerified || false);
      setIsOtpSent(currentLead.formData.step2.otpSent || false);
    }
  }, [currentLead]);

  const handleSendOtp = () => {
    if (formData.mobile.length !== 10) {
      toast({ title: 'Error', description: 'Please enter a 10-digit mobile number.', variant: 'destructive' });
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setIsOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: `Mock OTP (${MOCK_OTP}) sent successfully.`,
        className: 'bg-blue-50 border-blue-200'
      });
      // Save OTP sent status to context for persistence
      updateLead(currentLead!.id, {
        formData: {
            ...currentLead!.formData,
            step2: { ...currentLead!.formData.step2, otpSent: true, mobile: formData.mobile, isMobileVerified: isMobileVerified }
        }
      });
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp === MOCK_OTP) {
      setIsMobileVerified(true);
      setIsOtpSent(false); // Hide OTP input on success
      setOtp(''); // Clear OTP state
      toast({
        title: 'Verification Successful',
        description: 'Mobile number verified.',
        className: 'bg-green-50 border-green-200'
      });
    } else {
      toast({
        title: 'Verification Failed',
        description: 'Invalid OTP. Please try again.',
        variant: 'destructive'
      });
      setOtp('');
    }
  };

  const handleNext = () => {
    if (!currentLead || !isMobileVerified || !formData.firstName || !formData.lastName) return;

    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step2: { ...formData, isMobileVerified, otpSent: false }
      },
      customerMobile: formData.mobile,
      customerFirstName: formData.firstName,
      customerLastName: formData.lastName,
      currentStep: 3
    });
    router.push('/lead/step3');
  };

  const handleExit = () => {
    if (!currentLead) {
        router.push('/leads');
        return;
    }
    // Save current data as draft before exiting
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step2: { ...formData, isMobileVerified, otpSent: isOtpSent }
      },
      currentStep: 2
    });
    router.push('/leads');
  };

  const handlePrevious = () => {
    router.push('/lead/step1');
  };

  const canProceed = isMobileVerified && formData.firstName && formData.lastName;

  return (
    <DashboardLayout 
        title="Primary Customer - Consent - Step 2" 
        showNotifications={false}
        showExitButton={true} 
        onExit={handleExit} 
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={2} totalSteps={11} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Consent & Details</h2>

          <div className="space-y-4">
            {/* 1. Mobile Number with Country Code (HTML Order 1) */}
            <div>
                <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
                <div className="flex space-x-2 items-center">
                    <div className={cn("relative w-24", isMobileVerified && "opacity-70")}>
                        <Select
                            value={formData.countryCode}
                            onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                            disabled={isMobileVerified || isOtpSent}
                        >
                            <SelectTrigger id="country-code" className="h-12">
                                <SelectValue placeholder="+91" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="+91">+91</SelectItem>
                                <SelectItem value="+1">+1</SelectItem>
                                <SelectItem value="+44">+44</SelectItem>
                                <SelectItem value="+971">+971</SelectItem>
                                <SelectItem value="+65">+65</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative flex-1">
                      <Input
                        id="mobile"
                        type="tel"
                        maxLength={10}
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                        placeholder="Enter 10-digit mobile number"
                        className="h-12 pr-12"
                        disabled={isMobileVerified || isOtpSent}
                      />
                      {isMobileVerified && (
                        <CheckCircle className="w-5 h-5 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                    <Button
                      onClick={handleSendOtp}
                      disabled={isMobileVerified || isSendingOtp || isOtpSent || formData.mobile.length !== 10}
                      className="h-12 w-32 bg-blue-500 hover:bg-blue-600"
                    >
                      {isSendingOtp ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      {isSendingOtp ? 'Sending...' : (isOtpSent ? 'Resend' : 'Send OTP')}
                    </Button>
                </div>
            </div>

            {/* 2. Salutation (HTML Order 2) */}
            <div>
              <Label>Salutation</Label>
              <RadioGroup 
                value={formData.salutation} 
                onValueChange={(value) => setFormData({ ...formData, salutation: value })}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Mr" id="mr" />
                  <Label htmlFor="mr">Mr</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Mrs" id="mrs" />
                  <Label htmlFor="mrs">Mrs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Ms" id="ms" />
                  <Label htmlFor="ms">Ms</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* 3. Name Fields (HTML Order 3 & 4) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                  className="h-12"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                  className="h-12"
                  maxLength={50}
                />
              </div>
            </div>

            {/* OTP Verification Input (HTML Order 5) */}
            {isOtpSent && !isMobileVerified && (
              <div className="space-y-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <Label>Enter 6-Digit OTP (Mock: {MOCK_OTP})</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6}
                  className="w-full h-10 bg-green-600 hover:bg-green-700 font-semibold"
                >
                  Verify OTP
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="h-12 px-8"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
