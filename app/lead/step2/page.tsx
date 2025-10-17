
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Added Edit, X icons and all necessary component imports
import { Calendar, CheckCircle, AlertTriangle, Loader, Edit, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
// Assuming validatePANDetails and PAN_DATA are available here, 
// using the internal mock-auth logic by implicitly importing required module components
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
// ALERT DIALOG IMPORTS ARE CRUCIAL FOR THE POPUP
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

type ValidationStatus = 'pending' | 'valid' | 'invalid' | 'mismatch';

// Helper component for the Customer Name/Edit Popup
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
    
    // Sync state when dialog opens or parent data changes
    useEffect(() => {
        setFirstName(currentFirstName);
        setLastName(currentLastName);
        setMismatchReason(currentMismatchReason);
    }, [currentFirstName, currentLastName, currentMismatchReason, isOpen]);
    
    const handleCancel = () => {
        // Reset local state back to props on cancel
        setFirstName(currentFirstName);
        setLastName(currentLastName);
        setMismatchReason(currentMismatchReason);
        setIsOpen(false);
    };

    const handleSave = () => {
        // Trigger save even if only the reason changes (isReasonProvided is true)
        const reason = mismatchReason.trim();
        onSave(firstName, lastName, reason);
        setIsOpen(false);
    };

    // Check if the name has been manually changed OR if a reason has been typed
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
                        Update the customer's name. If a PAN mismatch occurs, you can optionally provide a reason.
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
  
  // Consolidated formData structure
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

  // Local state for validation results and UI flags
  const [panValidationStatus, setPanValidationStatus] = useState<ValidationStatus>('pending');
  const [panApiName, setPanApiName] = useState('');
  const [nameMismatchReason, setNameMismatchReason] = useState(currentLead?.formData?.step2?.nameMismatchReason || '');
  const [isPanTouched, setIsPanTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  // State for Name Edit Logic
  const [isNameEditOpen, setIsNameEditOpen] = useState(false);
  const [localFirstName, setLocalFirstName] = useState(currentLead?.customerFirstName || '');
  const [localLastName, setLocalLastName] = useState(currentLead?.customerLastName || '');

  // Initial load and sync with currentLead
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
        // Use local state for names which might be different from customerName on lead object
        setLocalFirstName(currentLead.customerFirstName || '');
        setLocalLastName(currentLead.customerLastName || '');
        setNameMismatchReason(step2Data.nameMismatchReason || '');
        
        // Re-run validation on load if PAN is present
        if (currentLead.panNumber) {
            handlePanValidation(currentLead.panNumber, currentLead.customerFirstName || '', currentLead.customerLastName || '');
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLead]);
  
  const handlePanValidation = (pan: string, firstName: string, lastName: string) => {
    // Basic validation for PAN length
    if (pan.length !== 10) {
        setPanValidationStatus('pending');
        setPanApiName('');
        return;
    }
    setIsPanTouched(true);
    setPanValidationStatus('pending');
    
    // Mock API Call Simulation
    setTimeout(() => {
        // validatePANDetails compares provided names against mock PAN data
        const result = validatePANDetails(pan, 'Mr', firstName, lastName);
        
        // Find the actual mock PAN data to get the expected name (used for display)
        const panData = PAN_DATA.find((p: any) => p.pan.toUpperCase() === pan.toUpperCase());

        if (panData) {
            // Use the name from the mock data for display in PAN Name field
            const fetchedName = `${panData.firstName} ${panData.lastName}`.trim().toUpperCase();
            setPanApiName(fetchedName);

            // Check if the current user name matches the fetched name
            if (result.firstNameMatch && result.lastNameMatch) {
                setPanValidationStatus('valid');
            } else {
                setPanValidationStatus('mismatch');
            }
        } else {
            // PAN number is 10 digits but not found in the mock data
            setPanValidationStatus('invalid');
            setPanApiName('');
        }
    }, 1500);
  };
  
  const handlePanInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Only validate if input value changed AND has PAN is 'yes'
    if (formData.hasPan === 'yes') {
        const newPan = e.target.value.toUpperCase();
        
        // Trigger validation if the PAN value has changed or validation hasn't run
        if (newPan !== formData.pan || panValidationStatus === 'pending') {
             setFormData(prev => ({...prev, pan: newPan})); // Update PAN immediately in form data
             handlePanValidation(newPan, localFirstName, localLastName);
        }
    }
  };

  const handleNameSave = (newFirstName: string, newLastName: string, mismatchReason: string) => {
    // 1. Update local state
    setLocalFirstName(newFirstName);
    setLocalLastName(newLastName);
    setNameMismatchReason(mismatchReason);
    
    // 2. Re-run PAN validation against the new name
    if (formData.hasPan === 'yes' && formData.pan.length === 10) {
        handlePanValidation(formData.pan, newFirstName, newLastName);
    }
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
    
    // Block progression if PAN is invalid
    if (formData.hasPan === 'yes' && panValidationStatus === 'invalid') {
        return;
    }
    
    updateLead(currentLead.id, {
      // Save local first/last name and nameMismatchReason into lead object
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
  
  // Check conditions for proceeding
  // The user can proceed if:
  // 1. Has PAN and status is VALID or MISMATCH (mismatch reason is OPTIONAL now)
  // 2. Does NOT have PAN and all mandatory fields are filled
  // 3. DOB, Gender, and Email validation passes
  const isPanValidAndMatched = formData.hasPan === 'yes' && (panValidationStatus === 'valid' || panValidationStatus === 'mismatch');
  const isNoPanValid = formData.hasPan === 'no' && formData.panUnavailabilityReason && formData.alternateIdType && formData.documentNumber;
  
  const canProceed = formData.dob && formData.gender && !emailError && (isPanValidAndMatched || isNoPanValid);
    
  const customerFullName = `${localFirstName} ${localLastName}`.trim();
  const isNameMismatch = panValidationStatus === 'mismatch';

  return (
    <DashboardLayout title="Customer Details" showNotifications={false} showExitButton={true}>
      {/* Name Edit Dialog - always present but hidden until opened */}
      <NameEditDialog
            isOpen={isNameEditOpen}
            setIsOpen={setIsNameEditOpen}
            currentFirstName={localFirstName}
            currentLastName={localLastName}
            currentMismatchReason={nameMismatchReason}
            onSave={handleNameSave}
        />
        
      <div className="max-w-2xl mx-auto pb-24">
        <ProgressBar currentStep={2} totalSteps={10} />
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="space-y-4">
                 <div className="flex items-start justify-between">
                    <div>
                        <Label className="block text-xs font-medium text-neutral mb-1">Customer Name</Label>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#003366]">{customerFullName || 'N/A'}</p>
                            {isNameMismatch && (
                                <AlertTriangle className="text-yellow-600 w-4 h-4" title="Name Mismatch Detected"/>
                            )}
                        </div>
                    </div>
                    {/* Edit Button next to Customer Name */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsNameEditOpen(true)}
                        className='w-8 h-8 rounded-full flex-shrink-0'
                        title="Edit Customer Name"
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
                        setFormData({ ...formData, hasPan: value, pan: '' }); // Clear PAN field on switch
                        setPanValidationStatus('pending'); // Reset status
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
                             <div className="relative">
                                <Input 
                                    id="pan-input" 
                                    maxLength={10} 
                                    placeholder="ABCDE1234F" 
                                    value={formData.pan} 
                                    // We only update formData.pan on keystroke; validation runs on blur
                                    onChange={e => setFormData(prev => ({...prev, pan: e.target.value.toUpperCase()}))} 
                                    onBlur={handlePanInputBlur} 
                                    className={cn("w-full h-12 px-4 py-3 border-gray-300 rounded-xl uppercase tracking-wider", panValidationStatus === 'invalid' && 'border-red-500')}
                                />
                                {panValidationStatus === 'pending' && isPanTouched && <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0072CE] animate-spin w-5 h-5" />}
                                {panValidationStatus === 'valid' && <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#16A34A] w-5 h-5" />}
                                {panValidationStatus === 'invalid' && <X className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#DC2626] w-5 h-5" />}
                                {panValidationStatus === 'mismatch' && <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-600 w-5 h-5" />}
                             </div>
                             {/* ERROR MESSAGE: Invalid PAN */}
                             {panValidationStatus === 'invalid' && (
                                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                    <X className="w-4 h-4" /> Invalid PAN: Record not found. Please check and re-enter.
                                </p>
                             )}
                        </div>
                        
                        {/* VALIDATION STATUS CARD: Valid */}
                        {panValidationStatus === 'valid' && (
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
                        
                        {/* VALIDATION STATUS CARD: Mismatch */}
                         {panValidationStatus === 'mismatch' && (
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
                
                {/* No PAN Section */}
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
