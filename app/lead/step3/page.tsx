'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { validatePAN, VALID_PAN } from '@/lib/mock-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as DatePicker } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Step3Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    customerType: currentLead?.formData?.step3?.customerType || 'individual',
    hasPan: currentLead?.formData?.step3?.hasPan || 'yes',
    pan: currentLead?.panNumber || '',
    salutation: currentLead?.formData?.step3?.salutation || 'Mr', // New Field
    firstName: currentLead?.customerFirstName || '', // New Field
    lastName: currentLead?.customerLastName || '',   // New Field
    dob: currentLead?.dob || '',
    age: currentLead?.age || 0,
    gender: currentLead?.gender || 'male',
    email: currentLead?.formData?.step3?.email || '', // New Field
    nationality: currentLead?.formData?.step3?.nationality || 'India', // New Field
    residentType: currentLead?.formData?.step3?.residentType || 'resident',
  });
  const [panStatus, setPanStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');

  useEffect(() => {
    // Sync external fields back into form data
    setFormData(prev => ({
        ...prev,
        pan: currentLead?.panNumber || prev.pan,
        firstName: currentLead?.customerFirstName || prev.firstName,
        lastName: currentLead?.customerLastName || prev.lastName,
        dob: currentLead?.dob || prev.dob,
        age: currentLead?.age || prev.age,
        gender: currentLead?.gender || prev.gender,
    }));
    
    // Run initial PAN check
    if (currentLead?.panNumber && currentLead.panNumber.length === 10) {
      const isValid = validatePAN(currentLead.panNumber);
      setPanStatus(isValid ? 'valid' : 'invalid');
    }

  }, [currentLead]);
  
  // PAN Validation Logic
  useEffect(() => {
    if (formData.pan.length === 10) {
      const isValid = validatePAN(formData.pan);
      setPanStatus(isValid ? 'valid' : 'invalid');
    } else {
      setPanStatus('pending');
    }
  }, [formData.pan]);
  
  // DOB/Age calculation
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const dobString = format(date, 'yyyy-MM-dd');
      const today = new Date();
      const birthDate = new Date(dobString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData({ ...formData, dob: dobString, age: age });
    }
  };


  const handleNext = () => {
    if (!currentLead || (formData.hasPan === 'yes' && panStatus !== 'valid') || !formData.dob || !formData.firstName || !formData.lastName || !formData.residentType) return;

    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step3: formData
      },
      panNumber: formData.hasPan === 'yes' ? formData.pan : undefined,
      dob: formData.dob,
      age: formData.age,
      gender: formData.gender,
      customerFirstName: formData.firstName, // Save name fields back to top level
      customerLastName: formData.lastName,
      currentStep: 4
    });
    router.push('/lead/step4');
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
        step3: formData
      },
      currentStep: 3
    });
    router.push('/leads');
  };


  const handlePrevious = () => {
    router.push('/lead/step2');
  };

  const canProceed = formData.dob && formData.firstName && formData.lastName && formData.residentType && (formData.hasPan === 'no' || panStatus === 'valid');

  return (
    <DashboardLayout 
        title="Personal Details - Step 3" 
        showNotifications={false}
        showExitButton={true} 
        onExit={handleExit} 
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={3} totalSteps={11} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer's Personal Information</h2>

          <div className="space-y-4">
            
            {/* 1. Customer Type (HTML Order 1) */}
            <div>
              <Label>Customer Type</Label>
              <RadioGroup 
                value={formData.customerType} 
                onValueChange={(value) => setFormData({ ...formData, customerType: value })}
                className="flex space-x-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual">Individual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non-individual" id="non-individual" />
                  <Label htmlFor="non-individual">Non-Individual</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* 2. Verified Mobile Number - OMITTED, already verified in Step 2 */}
            
            {/* 3. PAN Availability (HTML Order 3) */}
            <div>
              <Label>Does the customer have a PAN?</Label>
              <RadioGroup 
                value={formData.hasPan} 
                onValueChange={(value) => setFormData({ ...formData, hasPan: value, pan: (value === 'no' ? '' : formData.pan) })}
                className="flex space-x-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="pan-yes" />
                  <Label htmlFor="pan-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="pan-no" />
                  <Label htmlFor="pan-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 4. PAN Section (HTML Order 4) */}
            {formData.hasPan === 'yes' && (
              <div>
                <Label htmlFor="pan">PAN <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="pan"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="Enter PAN (e.g., AFZPK7190K)"
                    maxLength={10}
                    className={cn(
                      "h-12 pr-12 uppercase",
                      panStatus === 'valid' && 'border-green-500',
                      panStatus === 'invalid' && 'border-red-500'
                    )}
                  />
                  {panStatus === 'valid' && (
                    <CheckCircle className="w-5 h-5 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  )}
                  {panStatus === 'invalid' && (
                    <AlertTriangle className="w-5 h-5 text-red-600 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  )}
                </div>
                {panStatus === 'valid' && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">Valid PAN format. Mock: {VALID_PAN}</p>
                )}
                {panStatus === 'invalid' && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">Invalid PAN. Use mock PAN: {VALID_PAN}</p>
                )}
                {panStatus === 'pending' && formData.pan.length > 0 && formData.pan.length < 10 && (
                  <p className="text-xs text-gray-500 mt-1">PAN must be 10 characters.</p>
                )}
              </div>
            )}
            
            {/* 5 & 6. Salutation & Name Fields (HTML Order 5 & 6) */}
            <div>
                <Label htmlFor="salutation" className="flex items-center space-x-1">
                    <span>Salutation</span>
                    <Info className="w-3 h-3 text-amber-500" title="Changes will affect verified data"/>
                </Label>
                <RadioGroup 
                    value={formData.salutation} 
                    onValueChange={(value) => setFormData({ ...formData, salutation: value })}
                    className="flex space-x-6 mt-2 mb-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Mr" id="s-mr" />
                        <Label htmlFor="s-mr">Mr</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Mrs" id="s-mrs" />
                        <Label htmlFor="s-mrs">Mrs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Ms" id="s-ms" />
                        <Label htmlFor="s-ms">Ms</Label>
                    </div>
                </RadioGroup>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="flex items-center space-x-1">
                    <span>First Name</span> <span className="text-red-500">*</span>
                    <Info className="w-3 h-3 text-amber-500" title="Changes will affect verified data"/>
                  </Label>
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
                  <Label htmlFor="lastName" className="flex items-center space-x-1">
                    <span>Last Name</span> <span className="text-red-500">*</span>
                    <Info className="w-3 h-3 text-amber-500" title="Changes will affect verified data"/>
                  </Label>
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
            </div>

            {/* 7. Date of Birth / Age (HTML Order 7) */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-12",
                          !formData.dob && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.dob ? format(new Date(formData.dob), "dd/MM/yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DatePicker
                        mode="single"
                        selected={formData.dob ? new Date(formData.dob) : undefined}
                        onSelect={handleDateChange}
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="text"
                    value={formData.age ? `Age: ${formData.age}` : 'Age: XX'}
                    readOnly
                    disabled
                    className="h-12 text-center font-bold bg-blue-50 border-blue-200 text-blue-600"
                  />
                </div>
            </div>

            {/* 8. Gender (HTML Order 8) */}
            <div>
              <Label>Gender</Label>
              <RadioGroup 
                value={formData.gender} 
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="g-male" />
                  <Label htmlFor="g-male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="g-female" />
                  <Label htmlFor="g-female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="third-gender" id="g-third" />
                  <Label htmlFor="g-third">Third Gender</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-specified" id="g-not" />
                  <Label htmlFor="g-not">Not Specified</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* 9. Email (HTML Order 9) */}
            <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="h-12"
                />
            </div>

            {/* 10. Nationality (HTML Order 10) */}
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Select
                value={formData.nationality}
                onValueChange={(value) => setFormData({ ...formData, nationality: value })}
              >
                <SelectTrigger id="nationality" className="h-12">
                  <SelectValue placeholder="Select Nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 11. Resident Type (HTML Order 11) */}
            <div>
              <Label>Resident Type <span className="text-red-500">*</span></Label>
              <RadioGroup 
                value={formData.residentType} 
                onValueChange={(value) => setFormData({ ...formData, residentType: value })}
                className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="resident" id="r-resident" />
                  <Label htmlFor="r-resident">Resident</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non-resident" id="r-non-resident" />
                  <Label htmlFor="r-non-resident">Non-Resident</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="indian-origin" id="r-indian-origin" />
                  <Label htmlFor="r-indian-origin">Indian Origin</Label>
                </div>
              </RadioGroup>
            </div>

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
