'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea

export default function Step8Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  const [formData, setFormData] = useState({
    loanAmount: currentLead?.loanAmount || 500000,
    currency: currentLead?.formData?.step8?.currency || 'INR', // Added Currency
    loanPurpose: currentLead?.loanPurpose || '',
    customPurpose: currentLead?.formData?.step8?.customPurpose || '', // Added Custom Purpose
    purposeDescription: currentLead?.formData?.step8?.purposeDescription || '', // Added Description
    productCode: currentLead?.formData?.step8?.productCode || '',
    schemeCode: currentLead?.formData?.step8?.schemeCode || '', // Added Scheme Code
    interestRate: currentLead?.formData?.step8?.interestRate || '',
    tenure: currentLead?.formData?.step8?.tenure || '',
    tenureUnit: currentLead?.formData?.step8?.tenureUnit || 'months', // Added Tenure Unit
    applicationType: currentLead?.formData?.step8?.applicationType || 'new', // Overwritten by step 1 in real app, kept for form structure
    loanBranch: currentLead?.formData?.step8?.loanBranch || 'BR001', // Added Loan Branch
    assignedOfficer: currentLead?.formData?.step8?.assignedOfficer || '', // Added Assigned Officer
    sourcingChannel: currentLead?.formData?.step8?.sourcingChannel || 'direct', // Added Sourcing Channel
    sourcingBranch: currentLead?.formData?.step8?.sourcingBranch || '', // Added Sourcing Branch (Conditional)
  });

  useEffect(() => {
    if (currentLead?.formData?.step8) {
      setFormData(currentLead.formData.step8);
    }
  }, [currentLead]);
  
  const setField = (key: string, value: string | number | string[]) => setFormData(prev => ({ ...prev, [key]: value }));

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  const handleNext = () => {
    if (!currentLead) return;

    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step8: formData
      },
      loanAmount: formData.loanAmount,
      loanPurpose: formData.loanPurpose,
      currentStep: 9
    });
    router.push('/lead/step9');
  };

  const handleExit = () => {
    if (!currentLead) {
        router.push('/leads');
        return;
    }
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step8: formData
      },
      currentStep: 8
    });
    router.push('/leads');
  };


  const handlePrevious = () => {
    router.push('/lead/step7');
  };

  const isCustomPurposeRequired = formData.loanPurpose === 'others';
  const isLoanPurposeValid = formData.loanPurpose && (!isCustomPurposeRequired || formData.customPurpose);
  const canProceed = formData.loanAmount >= 50000 && isLoanPurposeValid && formData.productCode && formData.loanBranch && formData.assignedOfficer && formData.sourcingChannel;

  return (
    <DashboardLayout 
        title="Loan Details & Requirements - Step 8" 
        showNotifications={false}
        showExitButton={true} 
        onExit={handleExit}
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={8} totalSteps={11} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Loan Information</h2>

            <div className="space-y-6">
              
              {/* 1. Loan Amount Requested (with Slider) */}
              <div>
                <Label>Loan Amount Requested <span className="text-red-500">*</span></Label>
                <div className="flex mt-2">
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setField('currency', value)}
                  >
                    <SelectTrigger id="currency" className="h-12 w-24 rounded-r-none border-r-0">
                      <SelectValue placeholder="₹ INR" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ INR</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => setField('loanAmount', Number(e.target.value))}
                    placeholder="Enter loan amount"
                    className="h-12 rounded-l-none"
                    min={50000}
                    max={10000000}
                  />
                </div>
                <Slider
                  value={[formData.loanAmount]}
                  onValueChange={(value) => setField('loanAmount', value[0])}
                  min={50000}
                  max={10000000}
                  step={50000}
                  className="mt-4 mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>₹50K</span>
                  <span className="text-sm font-bold text-blue-600">{formatCurrency(formData.loanAmount)}</span>
                  <span>₹1 Cr</span>
                </div>
              </div>

              {/* 2. Loan Purpose */}
              <div>
                <Label htmlFor="loanPurpose">Loan Purpose <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.loanPurpose}
                  onValueChange={(value) => setField('loanPurpose', value)}
                >
                  <SelectTrigger id="loanPurpose" className="h-12">
                    <SelectValue placeholder="Select Loan Purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clnap">CLNAP</SelectItem>
                    <SelectItem value="cultivation">Cultivation</SelectItem>
                    <SelectItem value="harvesting">Harvesting</SelectItem>
                    <SelectItem value="sowing">Sowing</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Conditional Custom Purpose Input */}
              {isCustomPurposeRequired && (
                <div>
                  <Label htmlFor="customPurpose">Custom Purpose <span className="text-red-500">*</span></Label>
                  <Input
                      id="customPurpose"
                      value={formData.customPurpose}
                      onChange={(e) => setField('customPurpose', e.target.value)}
                      placeholder="Enter custom loan purpose"
                      className="h-12"
                  />
                </div>
              )}

              {/* 3. Loan Purpose Description */}
              <div>
                <Label htmlFor="purposeDescription">Loan Purpose Description</Label>
                <Textarea
                  id="purposeDescription"
                  value={formData.purposeDescription}
                  onChange={(e) => setField('purposeDescription', e.target.value)}
                  placeholder="Optional description (max 100 characters)"
                  className="min-h-[80px]"
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 mt-1">
                    {formData.purposeDescription.length}/100 characters
                </div>
              </div>

              {/* 4. Product Code */}
              <div>
                <Label htmlFor="productCode">Product Code <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.productCode}
                  onValueChange={(value) => setField('productCode', value)}
                >
                  <SelectTrigger id="productCode" className="h-12">
                    <SelectValue placeholder="Select Product Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGR001">AGR001 - Agricultural Loan</SelectItem>
                    <SelectItem value="BUS002">BUS002 - Business Loan</SelectItem>
                    <SelectItem value="PER003">PER003 - Personal Loan</SelectItem>
                    <SelectItem value="VEH004">VEH004 - Vehicle Loan</SelectItem>
                    <SelectItem value="HOM005">HOM005 - Home Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Scheme Code */}
              <div>
                <Label htmlFor="schemeCode">Scheme Code</Label>
                <Select
                  value={formData.schemeCode}
                  onValueChange={(value) => setField('schemeCode', value)}
                >
                  <SelectTrigger id="schemeCode" className="h-12">
                    <SelectValue placeholder="Auto-populated based on product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCH001">SCH001 - Standard Scheme</SelectItem>
                    <SelectItem value="SCH002">SCH002 - Priority Scheme</SelectItem>
                    <SelectItem value="SCH003">SCH003 - Special Scheme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 6. Interest Rate & Tenure Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Interest Rate */}
                <div>
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => setField('interestRate', e.target.value)}
                    placeholder="12.5"
                    className="h-12"
                    step="0.1" min="0" max="50"
                  />
                </div>

                {/* Tenure */}
                <div>
                  <Label htmlFor="tenure">Tenure</Label>
                  <div className="flex">
                    <Input
                      id="tenure"
                      type="number"
                      value={formData.tenure}
                      onChange={(e) => setField('tenure', e.target.value)}
                      placeholder="24"
                      className="h-12 rounded-r-none border-r-0"
                      min="1" max="999"
                    />
                    <Select
                        value={formData.tenureUnit}
                        onValueChange={(value) => setField('tenureUnit', value)}
                    >
                        <SelectTrigger id="tenureUnit" className="h-12 w-20 rounded-l-none">
                            <SelectValue placeholder="Months" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="months">Months</SelectItem>
                            <SelectItem value="years">Years</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 7. Application Type (for loan products, might differ from step 1) */}
              <div>
                <Label htmlFor="applicationType">Application Type</Label>
                <Select
                  value={formData.applicationType}
                  onValueChange={(value) => setField('applicationType', value)}
                >
                  <SelectTrigger id="applicationType" className="h-12">
                    <SelectValue placeholder="New Application" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Application</SelectItem>
                    <SelectItem value="balance-transfer">Balance Transfer</SelectItem>
                    <SelectItem value="bt-topup">Balance Transfer with Top-up</SelectItem>
                    <SelectItem value="renewal">Renewal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* 8 & 9. Loan Branch and Assigned Officer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loanBranch">Loan Branch <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.loanBranch}
                    onValueChange={(value) => setField('loanBranch', value)}
                  >
                    <SelectTrigger id="loanBranch" className="h-12">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BR001">BR001 - Mumbai Central</SelectItem>
                      <SelectItem value="BR002">BR002 - Delhi North</SelectItem>
                      <SelectItem value="BR003">BR003 - Bangalore South</SelectItem>
                      <SelectItem value="BR004">BR004 - Chennai East</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignedOfficer">Assigned Officer <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.assignedOfficer}
                    onValueChange={(value) => setField('assignedOfficer', value)}
                  >
                    <SelectTrigger id="assignedOfficer" className="h-12">
                      <SelectValue placeholder="Select Officer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OFF001">Rajesh Kumar - Senior Manager</SelectItem>
                      <SelectItem value="OFF002">Priya Sharma - Loan Officer</SelectItem>
                      <SelectItem value="OFF003">Amit Patel - Credit Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 10. Sourcing Channel */}
              <div>
                <Label htmlFor="sourcingChannel">Sourcing Channel <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.sourcingChannel}
                  onValueChange={(value) => setField('sourcingChannel', value)}
                >
                  <SelectTrigger id="sourcingChannel" className="h-12">
                    <SelectValue placeholder="Select Sourcing Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 11. Sourcing Branch (Conditional, hidden in HTML when not needed) */}
              {formData.sourcingChannel !== 'direct' && (
                <div>
                  <Label htmlFor="sourcingBranch">Sourcing Branch</Label>
                  <Select
                    value={formData.sourcingBranch}
                    onValueChange={(value) => setField('sourcingBranch', value)}
                  >
                    <SelectTrigger id="sourcingBranch" className="h-12">
                      <SelectValue placeholder="Select Sourcing Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SBR001">SBR001 - Partner Branch A</SelectItem>
                      <SelectItem value="SBR002">SBR002 - Partner Branch B</SelectItem>
                      <SelectItem value="SBR003">SBR003 - Partner Branch C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
