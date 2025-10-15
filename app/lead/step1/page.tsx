
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Info } from 'lucide-react';

export default function Step1Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    productType: currentLead?.formData?.step1?.productType || '',
    branchCode: currentLead?.formData?.step1?.branchCode || 'BR001 - Mumbai Central',
    applicationType: currentLead?.formData?.step1?.applicationType || 'new',
  });

  // Autosave form data on change, but DO NOT update the currentStep here
  useEffect(() => {
    if (currentLead) {
        updateLead(currentLead.id, {
            formData: { ...currentLead.formData, step1: formData },
        });
    }
  }, [formData]);

  const handleNext = () => {
    if (!currentLead) return;
    // Update the currentStep ONLY when the user clicks Next
    updateLead(currentLead.id, {
      currentStep: 2
    });
    router.push('/lead/step2');
  };

  const canProceed = formData.productType && formData.branchCode;

  return (
    <DashboardLayout 
        title="New Lead Application" 
        showNotifications={false}
        showExitButton={true} 
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={1} totalSteps={11} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productType" className="flex items-center space-x-1">
                <span>Product Type</span> <span className="text-red-500">*</span>
                <Info className="w-3 h-3 text-gray-500" title="Select loan security type."/>
              </Label>
              <Select
                value={formData.productType}
                onValueChange={(value) => setFormData({ ...formData, productType: value })}
              >
                <SelectTrigger id="productType" className="h-12">
                  <SelectValue placeholder="Select Product Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secured">Secured</SelectItem>
                  <SelectItem value="unsecured">Unsecured</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="branchCode">Branch Code</Label>
              <div className="relative">
                <Input
                  id="branchCode"
                  type="text"
                  value={formData.branchCode}
                  placeholder="Search branch..."
                  readOnly
                  disabled
                  className="h-12 bg-gray-50 border-gray-200 pr-10"
                />
                <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-populated with your default branch</p>
            </div>
            <div>
              <Label htmlFor="applicationType">Application Type</Label>
              <Select
                value={formData.applicationType}
                onValueChange={(value) => setFormData({ ...formData, applicationType: value })}
              >
                <SelectTrigger id="applicationType" className="h-12">
                  <SelectValue placeholder="Select application type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Application</SelectItem>
                  <SelectItem value="balance-transfer">Balance Transfer</SelectItem>
                  <SelectItem value="bt-topup">Balance Transfer with Top-up</SelectItem>
                  <SelectItem value="renewal">Loan Renewal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
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
