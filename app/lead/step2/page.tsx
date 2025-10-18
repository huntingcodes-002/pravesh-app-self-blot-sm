'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CheckCircle, AlertTriangle, Loader, Edit, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { validatePANDetails, PAN_DATA } from '@/lib/mock-auth'; 
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
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

type ValidationStatus = 'pending' | 'valid' | 'invalid' | 'mismatch';

function NameEditDialog({ 
    isOpen, 
    setIsOpen, 
    currentFirstName, 
    currentLastName, 
    currentMismatchReason,
    onSave 
}: { 
    isOpen: boolean, 
    setIsOpen: (open: boolean) => void, 
    currentFirstName: string, 
    currentLastName: string, 
    currentMismatchReason: string,
    onSave: (newFirstName: string, newLastName: string, mismatchReason: string) => void 
}) {
    const [firstName, setFirstName] = useState(currentFirstName);
    const [lastName, setLastName] = useState(currentLastName);
    const [mismatchReason, setMismatchReason] = useState(currentMismatchReason);
    
    useEffect(() => {
        setFirstName(currentFirstName);
        setLastName(currentLastName);
        setMismatchReason(currentMismatchReason);
    }, [currentFirstName, currentLastName, currentMismatchReason, isOpen]);
    
    const handleCancel = () => {
        setFirstName(currentFirstName);
        setLastName(currentLastName);
        setMismatchReason(currentMismatchReason);
        setIsOpen(false);
    };

    const handleSave = () => {
        const reason = mismatchReason.trim();
        onSave(firstName, lastName, reason);
        setIsOpen(false);
    };

    const isNameChanged = firstName !== currentFirstName || lastName !== currentLastName;
    const isReasonChanged = mismatchReason.trim() !== currentMismatchReason.trim();
    const canSave = isNameChanged || isReasonChanged;

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center text-[#003366]">
                       <Edit className="w-5 h-5 mr-2" /> Update Customer Name
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Update the customer&apos;s name. If a PAN mismatch occurs, you can optionally provide a reason.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <Label htmlFor="edit-first-name" className="text-sm font-medium text-[#003366] mb-2 block">First Name</Label>
                            <Input 
                                id="edit-first-name" 
                                value={firstName} 
                                onChange={e => setFirstName(e.target.value)} 
                                placeholder="Enter First Name" 
                                className="h-10 rounded-lg"
                                maxLength={100}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-last-name" className="text-sm font-medium text-[#003366] mb-2 block">Last Name</Label>
                            <Input 
                                id="edit-last-name" 
                                value={lastName} 
                                onChange={e => setLastName(e.target.value)} 
                                placeholder="Enter Last Name" 
                                className="h-10 rounded-lg"
                                maxLength={50}
                            />
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <Label htmlFor="mismatch-reason" className="text-sm font-medium text-[#003366] mb-2 block">Reason for Name Difference (Optional)</Label>
                        <Textarea 
                            id="mismatch-reason" 
                            value={mismatchReason} 
                            onChange={e => setMismatchReason(e.target.value)} 
                            placeholder="e.g., Name change post marriage, short name usage..." 
                            rows={2} 
                            className="rounded-lg"
                            maxLength={255}
                        />
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild><Button variant="outline" onClick={handleCancel}>Cancel</Button></AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button 
                            onClick={handleSave} 
                            disabled={!canSave}
                            className={cn(canSave ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300')}
                        >
                            Save Changes
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

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
  const [nameMismatchReason, setNameMismatchReason] = useState(currentLead?.formData?.step2?.nameMismatchReason || '');
  const [isPanTouched, setIsPanTouched] = useState(false);
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const [isNameEditOpen, setIsNameEditOpen] = useState(false);
  const [localFirstName, setLocalFirstName] = useState(currentLead?.customerFirstName || '');
  const [localLastName, setLocalLastName] = useState(currentLead?.customerLastName || '');

  const handlePanValidation = React.useCallback((pan: string, firstName: string, lastName: string) => {
    if (pan.length !== 10) {
        setPanValidationStatus('pending');
        setPanApiName('');
        return;
    }
    setIsVerifyingPan(true);
    setPanValidationStatus('pending');
    
    setTimeout(() => {
        const result = validatePANDetails(pan, 'Mr', firstName, lastName);
        const panData = PAN_DATA.find((p: any) => p.pan.toUpperCase() === pan.toUpperCase());

        if (panData) {
            const fetchedName = `${panData.firstName} ${panData.lastName}`.trim().toUpperCase();
            setPanApiName(fetchedName);
            if (result.firstNameMatch && result.lastNameMatch) {
                setPanValidationStatus('valid');
            } else {
                setPanValidationStatus('mismatch');
            }
        } else {
            setPanValidationStatus('invalid');
            setPanApiName('');
        }
        setIsVerifyingPan(false);
    }, 1500);
  }, []);

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
        setLocalFirstName(currentLead.customerFirstName || '');
        setLocalLastName(currentLead.customerLastName || '');
        setNameMismatchReason(step2Data.nameMismatchReason || '');
        
        if (currentLead.panNumber) {
            setIsPanTouched(true);
            handlePanValidation(currentLead.panNumber, currentLead.customerFirstName || '', currentLead.customerLastName || '');
        }
    }
  }, [currentLead, handlePanValidation]);

  useEffect(() => {
    if (formData.hasPan === 'yes' && formData.pan.length === 10) {
        handlePanValidation(formData.pan, localFirstName, localLastName);
    }
  }, [formData.pan, formData.hasPan, localFirstName, localLastName, handlePanValidation]);
  
  const handlePanInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (formData.hasPan === 'yes') {
        const newPan = e.target.value.toUpperCase();
        if (newPan !== formData.pan || panValidationStatus === 'pending') {
             setFormData(prev => ({...prev, pan: newPan}));
        }
    }
  };

  const handleNameSave = (newFirstName: string, newLastName: string, mismatchReason: string) => {
    setLocalFirstName(newFirstName);
    setLocalLastName(newLastName);
    setNameMismatchReason(mismatchReason);
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
    
    if (formData.hasPan === 'yes' && panValidationStatus === 'invalid') {
        return;
    }
    
    updateLead(currentLead.id, {
      formData: { ...currentLead.formData, step2: { ...formData, nameMismatchReason } },
      customerFirstName: localFirstName,
      customerLastName: localLastName,
      panNumber: formData.hasPan === 'yes' ? formData.pan : '',
      dob: formData.dob,
      age: formData.age,
      gender: formData.gender,
      currentStep: 3,
    });
    router.push('/lead/step3');
  };

  const handlePrevious = () => router.push('/lead/step1');
  
  const isPanValidAndMatched = formData.hasPan === 'yes' && (panValidationStatus === 'valid' || panValidationStatus === 'mismatch');
  const isNoPanValid = formData.hasPan === 'no' && formData.panUnavailabilityReason && formData.alternateIdType && formData.documentNumber;
  
  const canProceed = formData.dob && formData.gender && !emailError && (isPanValidAndMatched || isNoPanValid);
    
  const customerFullName = `${localFirstName} ${localLastName}`.trim();
  const isNameMismatch = panValidationStatus === 'mismatch';

  return (
    <DashboardLayout title="Customer Details" showNotifications={false} showExitButton={true}>
      <NameEditDialog
            isOpen={isNameEditOpen}
            setIsOpen={setIsNameEditOpen}
            currentFirstName={localFirstName}
            currentLastName={localLastName}
            currentMismatchReason={nameMismatchReason}
            onSave={handleNameSave}
        />
        
      <div className="max-w-2xl mx-auto pb-24">
        <ProgressBar currentStep={2} totalSteps={11} />
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="space-y-4">
                 <div className="flex items-start justify-between">
                    <div>
                        <Label className="block text-xs font-medium text-neutral mb-1">Customer Name</Label>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#003366]">{customerFullName || 'N/A'}</p>
                            {isNameMismatch && (
                                <AlertTriangle className="text-yellow-600 w-4 h-4" />
                            )}
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsNameEditOpen(true)}
                        className='w-8 h-8 rounded-full flex-shrink-0'
                        title="Edit Customer Name"
                        disabled={!isNameMismatch}
                    >
                        <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
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
                    <RadioGroup value={formData.hasPan} onValueChange={(value) => {
                        setFormData({ ...formData, hasPan: value, pan: '' });
                        setPanValidationStatus('pending');
                        setPanApiName('');
                        setIsPanTouched(false);
                    }} className="flex gap-4">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="pan-yes" /><Label htmlFor="pan-yes" className="font-normal">Yes</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="pan-no" /><Label htmlFor="pan-no" className="font-normal">No</Label></div>
                    </RadioGroup>
                </div>
                
                {formData.hasPan === 'yes' && (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="pan-input" className="text-sm font-medium text-[#003366] mb-2 block">PAN Number *</Label>
                             <div className="relative flex items-center">
                                <Input 
                                    id="pan-input" 
                                    maxLength={10} 
                                    placeholder="ABCDE1234F" 
                                    value={formData.pan} 
                                    onChange={e => {
                                        setIsPanTouched(true);
                                        setFormData(prev => ({...prev, pan: e.target.value.toUpperCase()}));
                                    }}
                                    onBlur={handlePanInputBlur} 
                                    className={cn("w-full h-12 px-4 py-3 border-gray-300 rounded-xl uppercase tracking-wider", panValidationStatus === 'invalid' && 'border-red-500')}
                                />
                                <div className="absolute right-3 h-full flex items-center">
                                    {isVerifyingPan && <Loader className="text-[#0072CE] animate-spin w-5 h-5" />}
                                    {!isVerifyingPan && panValidationStatus === 'valid' && <CheckCircle className="text-[#16A34A] w-5 h-5" />}
                                    {!isVerifyingPan && panValidationStatus === 'invalid' && <X className="text-[#DC2626] w-5 h-5" />}
                                    {!isVerifyingPan && panValidationStatus === 'mismatch' && <AlertTriangle className="text-yellow-600 w-5 h-5" />}
                                </div>
                             </div>
                             {panValidationStatus === 'invalid' && (
                                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                    <X className="w-4 h-4" /> Invalid PAN: Record not found. Please check and re-enter.
                                </p>
                             )}
                        </div>
                        
                        {panValidationStatus === 'valid' && !isVerifyingPan && (
                             <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-[#16A34A] w-5 h-5" />
                                        <span className="text-sm font-medium text-[#16A34A]">PAN Verified</span>
                                    </div>
                                </div>
                                <p className="text-sm text-[#003366]">Name on PAN: <span className="font-medium">{panApiName}</span></p>
                            </div>
                        )}
                        
                         {panValidationStatus === 'mismatch' && !isVerifyingPan && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="text-yellow-600 w-5 h-5" />
                                    <span className="text-sm font-medium text-yellow-800">Name Mismatch Detected</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-xs text-neutral mb-1">Consent Name (Form)</p>
                                        <p className="text-sm font-medium">{customerFullName}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-xs text-neutral mb-1">PAN Name (System)</p>
                                        <p className="text-sm font-medium">{panApiName || 'N/A'}</p>
                                    </div>
                                </div>
                                {nameMismatchReason && (
                                    <div className='mt-3 border-t pt-3 border-yellow-100'>
                                        <p className="text-xs font-medium text-yellow-900 mb-1">Provided Reason for Difference:</p>
                                        <p className="text-sm text-yellow-800 italic">{nameMismatchReason}</p>
                                    </div>
                                )}
                                {!nameMismatchReason && (
                                     <div className='mt-3 border-t pt-3 border-yellow-100'>
                                        <p className="text-xs text-yellow-700 italic">No reason provided. Use the Edit button above to document the reason if necessary.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {formData.hasPan === 'no' && (
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
                                    <SelectItem value="Aadhaar">Aadhaar</SelectItem>
                                    <SelectItem value="Passport">Passport</SelectItem>
                                    <SelectItem value="Voter ID">Voter ID</SelectItem>
                                    <SelectItem value="Driving License">Driving License</SelectItem>
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
