'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { validatePANDetails } from '@/lib/mock-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as DatePicker } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ValidationStatus = 'pending' | 'valid' | 'invalid' | 'mismatch';

export default function Step2Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    customerType: currentLead?.formData?.step2?.customerType || 'individual',
    hasPan: currentLead?.formData?.step2?.hasPan || 'yes',
    pan: currentLead?.panNumber || '',
    panUnavailabilityReason: currentLead?.formData?.step2?.panUnavailabilityReason || '',
    panUnavailabilityNotes: currentLead?.formData?.step2?.panUnavailabilityNotes || '',
    alternateIdType: currentLead?.formData?.step2?.alternateIdType || '',
    documentNumber: currentLead?.formData?.step2?.documentNumber || '',
    dob: currentLead?.dob || '',
    age: currentLead?.age || 0,
    gender: currentLead?.gender || '',
    email: currentLead?.formData?.step2?.email || '',
  });
  
  const [panValidationStatus, setPanValidationStatus] = useState<ValidationStatus>('pending');
  const [panApiName, setPanApiName] = useState('');
  const [nameMismatchReason, setNameMismatchReason] = useState('');
  const [isPanTouched, setIsPanTouched] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (currentLead) {
        const step2Data = currentLead.formData?.step2 || {};
        setFormData(prev => ({
            ...prev,
            customerType: step2Data.customerType || 'individual',
            hasPan: step2Data.hasPan || 'yes',
            pan: currentLead.panNumber || '',
            panUnavailabilityReason: step2Data.panUnavailabilityReason || '',
            panUnavailabilityNotes: step2Data.panUnavailabilityNotes || '',
            alternateIdType: step2Data.alternateIdType || '',
            documentNumber: step2Data.documentNumber || '',
            dob: currentLead.dob || '',
            age: currentLead.age || 0,
            gender: currentLead.gender || '',
            email: step2Data.email || '',
        }));
    }
  }, [currentLead]);
  
  const handlePanValidation = () => {
    if (formData.pan.length !== 10) return;
    setIsPanTouched(true);
    setPanValidationStatus('pending');
    
    setTimeout(() => {
        const result = validatePANDetails(formData.pan, 'Mr', currentLead?.customerFirstName || '', currentLead?.customerLastName || '');
        if (result.panExists) {
            const fetchedName = `${result.firstNameMatch ? currentLead?.customerFirstName : 'RAJESH'} ${result.lastNameMatch ? currentLead?.customerLastName : 'K'}`.toUpperCase();
            setPanApiName(fetchedName);
            if (`${currentLead?.customerFirstName} ${currentLead?.customerLastName}`.toLowerCase() === fetchedName.toLowerCase()) {
                setPanValidationStatus('valid');
            } else {
                setPanValidationStatus('mismatch');
            }
        } else {
            setPanValidationStatus('invalid');
        }
    }, 1500);
  };

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

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailError('Please enter a valid email address.');
    } else {
        setEmailError('');
    }
  };

  const handleNext = () => {
    if (!currentLead) return;
    updateLead(currentLead.id, {
      formData: { ...currentLead.formData, step2: formData },
      panNumber: formData.hasPan === 'yes' ? formData.pan : '',
      dob: formData.dob,
      age: formData.age,
      gender: formData.gender,
      currentStep: 3,
    });
    router.push('/lead/step3');
  };

  const handlePrevious = () => router.push('/lead/step1');
  
  const canProceed = formData.dob && formData.gender && !emailError &&
    (formData.hasPan === 'no' 
        ? (formData.panUnavailabilityReason && formData.alternateIdType && formData.documentNumber) 
        : (panValidationStatus === 'valid' || (panValidationStatus === 'mismatch' && nameMismatchReason))
    );

  return (
    <DashboardLayout title="Customer Details" showNotifications={false} showExitButton={true}>
      <div className="max-w-2xl mx-auto pb-24">
        <ProgressBar currentStep={2} totalSteps={10} />
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="space-y-4">
                 <div>
                    <Label className="block text-xs font-medium text-neutral mb-1">Customer Name</Label>
                    <p className="text-sm font-semibold text-[#003366]">{currentLead?.customerName || 'N/A'}</p>
                </div>
                <div>
                    <Label className="block text-xs font-medium text-neutral mb-1">Mobile Number</Label>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#003366]">{currentLead?.customerMobile ? `+91-${currentLead.customerMobile}` : 'N/A'}</p>
                        <CheckCircle className="text-[#16A34A] w-4 h-4" />
                    </div>
                </div>
                 <div>
                    <Label className="block text-xs font-medium text-neutral mb-2">Customer Type</Label>
                    <div className="flex bg-gray-100 rounded-full p-1 w-fit">
                        <Button size="sm" className={cn("px-4 py-2 text-sm font-medium rounded-full transition-all h-auto", formData.customerType === 'individual' ? 'bg-[#0072CE] text-white' : 'bg-transparent text-neutral hover:bg-gray-200')} onClick={() => setFormData({...formData, customerType: 'individual'})}>Individual</Button>
                        <Button size="sm" className={cn("px-4 py-2 text-sm font-medium rounded-full transition-all h-auto", formData.customerType === 'non-individual' ? 'bg-[#0072CE] text-white' : 'bg-transparent text-neutral hover:bg-gray-200')} onClick={() => setFormData({...formData, customerType: 'non-individual'})}>Non-Individual</Button>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="border-b border-gray-100 pb-2 mb-6">
                <h3 className="text-sm font-semibold text-[#003366]">Identity Verification</h3>
            </div>
          
            <div className="space-y-6">
                <div>
                    <Label className="block text-sm font-medium text-[#003366] mb-3">Does the customer have a PAN? *</Label>
                    <RadioGroup value={formData.hasPan} onValueChange={(value) => setFormData({ ...formData, hasPan: value, pan: '', panValidationStatus: 'pending' })} className="flex gap-4">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="pan-yes" /><Label htmlFor="pan-yes" className="font-normal">Yes</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="pan-no" /><Label htmlFor="pan-no" className="font-normal">No</Label></div>
                    </RadioGroup>
                </div>
                
                {formData.hasPan === 'yes' ? (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="pan-input" className="text-sm font-medium text-[#003366] mb-2 block">PAN Number *</Label>
                             <div className="relative">
                                <Input id="pan-input" maxLength={10} placeholder="ABCDE1234F" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value.toUpperCase()})} onBlur={handlePanValidation} className="w-full h-12 px-4 py-3 border-gray-300 rounded-xl uppercase tracking-wider"/>
                                {panValidationStatus === 'pending' && isPanTouched && <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0072CE] animate-spin" />}
                                {panValidationStatus === 'valid' && <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#16A34A]" />}
                                {panValidationStatus === 'invalid' && <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#DC2626]" />}
                             </div>
                        </div>
                        {isPanTouched && panValidationStatus === 'valid' && (
                             <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-[#16A34A]" />
                                        <span className="text-sm font-medium text-[#16A34A]">PAN Verified</span>
                                    </div>
                                </div>
                                <p className="text-sm text-[#003366]">Name on PAN: <span className="font-medium">{panApiName}</span></p>
                            </div>
                        )}
                         {isPanTouched && panValidationStatus === 'mismatch' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-800">Name Mismatch Detected</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-xs text-neutral mb-1">Consent Name</p>
                                        <p className="text-sm font-medium">{currentLead?.customerName}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-xs text-neutral mb-1">PAN Name</p>
                                        <p className="text-sm font-medium">{panApiName}</p>
                                    </div>
                                </div>
                                <Textarea placeholder="Reason for name difference..." value={nameMismatchReason} onChange={e => setNameMismatchReason(e.target.value)} rows={2} className="rounded-lg"/>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium text-[#003366] mb-2 block">PAN Unavailability Reason *</Label>
                            <Select value={formData.panUnavailabilityReason} onValueChange={v => setFormData({...formData, panUnavailabilityReason: v})}>
                                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select reason" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="not-handy">Not handy</SelectItem>
                                    <SelectItem value="not-allotted">Not allotted</SelectItem>
                                    <SelectItem value="name-change">Name change in progress</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(formData.panUnavailabilityReason === 'other' || formData.panUnavailabilityReason === 'name-change') && (
                            <div>
                                <Label className="text-sm font-medium text-[#003366] mb-2 block">Notes</Label>
                                <Textarea value={formData.panUnavailabilityNotes} onChange={e => setFormData({...formData, panUnavailabilityNotes: e.target.value})} placeholder="Please provide additional details..." className="rounded-xl"/>
                            </div>
                        )}
                        <div>
                             <Label className="text-sm font-medium text-[#003366] mb-2 block">Alternate Primary ID Type *</Label>
                             <Select value={formData.alternateIdType} onValueChange={v => setFormData({...formData, alternateIdType: v})}>
                                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select ID Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aadhaar">Aadhaar</SelectItem>
                                    <SelectItem value="passport">Passport</SelectItem>
                                    <SelectItem value="voter">Voter ID</SelectItem>
                                    <SelectItem value="driving">Driving License</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                         <div>
                            <Label className="text-sm font-medium text-[#003366] mb-2 block">Document Number *</Label>
                            <Input value={formData.documentNumber} onChange={e => setFormData({...formData, documentNumber: e.target.value})} placeholder="Enter document number" className="h-12 rounded-xl"/>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="border-t border-gray-100 pt-6 mt-6 space-y-6">
                 <h3 className="text-sm font-semibold text-[#003366]">Personal Details</h3>
                 <div>
                    <Label className="text-sm font-medium text-[#003366] mb-2 block">Date of Birth *</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal h-12 rounded-xl", !formData.dob && "text-muted-foreground")}>
                                <Calendar className="mr-2 h-4 w-4" />
                                {formData.dob ? format(new Date(formData.dob), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><DatePicker mode="single" selected={formData.dob ? new Date(formData.dob) : undefined} onSelect={handleDateChange} captionLayout="dropdown-buttons" fromYear={1920} toYear={new Date().getFullYear()} /></PopoverContent>
                    </Popover>
                    {formData.age > 0 && <div className="mt-3"><Badge className="bg-[#E6F0FA] text-[#0072CE]">Age: {formData.age} years</Badge></div>}
                </div>
                 <div>
                    <Label className="block text-sm font-medium text-[#003366] mb-3">Gender *</Label>
                     <RadioGroup value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })} className="grid grid-cols-2 gap-2">
                        <Label htmlFor="g-male" className={cn("flex items-center justify-center gap-2 p-3 border rounded-xl transition-all cursor-pointer", formData.gender === 'male' ? 'border-[#0072CE] bg-[#E6F0FA]/50' : 'border-gray-300')}><RadioGroupItem value="male" id="g-male" className="sr-only" /><span className="text-lg">👨</span>Male</Label>
                        <Label htmlFor="g-female" className={cn("flex items-center justify-center gap-2 p-3 border rounded-xl transition-all cursor-pointer", formData.gender === 'female' ? 'border-[#0072CE] bg-[#E6F0FA]/50' : 'border-gray-300')}><RadioGroupItem value="female" id="g-female" className="sr-only" />👩 Female</Label>
                        <Label htmlFor="g-other" className={cn("flex items-center justify-center gap-2 p-3 border rounded-xl transition-all cursor-pointer", formData.gender === 'other' ? 'border-[#0072CE] bg-[#E6F0FA]/50' : 'border-gray-300')}><RadioGroupItem value="other" id="g-other" className="sr-only" />⚧ Other</Label>
                        <Label htmlFor="g-not-specified" className={cn("flex items-center justify-center gap-2 p-3 border rounded-xl transition-all cursor-pointer", formData.gender === 'not-specified' ? 'border-[#0072CE] bg-[#E6F0FA]/50' : 'border-gray-300')}><RadioGroupItem value="not-specified" id="g-not-specified" className="sr-only" />⋯ Not Specified</Label>
                    </RadioGroup>
                </div>
                <div>
                    <Label className="text-sm font-medium text-[#003366] mb-2 block">Email (Optional)</Label>
                    <Input type="email" value={formData.email} onBlur={handleEmailBlur} onChange={e => { setFormData({...formData, email: e.target.value}); if (emailError) setEmailError(''); }} placeholder="customer@example.com" className={cn("h-12 rounded-xl", emailError && "border-red-500")}/>
                    {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
                </div>
            </div>
            
          <div className="flex justify-between pt-4">
            <Button onClick={handlePrevious} variant="outline" className="h-12 px-8 rounded-lg">Previous</Button>
            <Button onClick={handleNext} disabled={!canProceed} className="h-12 px-8 bg-[#0072CE] hover:bg-[#005a9e] text-white font-semibold rounded-lg">Next</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}