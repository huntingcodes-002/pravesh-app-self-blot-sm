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
import { Search, Info } from 'lucide-react'; // Import necessary icons

export default function Step1Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    productType: currentLead?.formData?.step1?.productType || '',
    branchCode: currentLead?.formData?.step1?.branchCode || 'BR001 - Mumbai Central', // Default from HTML
    applicationType: currentLead?.formData?.step1?.applicationType || 'new',
  });

  useEffect(() => {
    if (currentLead?.formData?.step1) {
      setFormData(prev => ({
        ...prev,
        productType: currentLead.formData.step1.productType,
        branchCode: currentLead.formData.step1.branchCode,
        applicationType: currentLead.formData.step1.applicationType,
      }));
    }
  }, [currentLead]);

  const handleNext = () => {
    if (!currentLead) return;
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step1: formData
      },
      currentStep: 2
    });
    router.push('/lead/step2');
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
        step1: formData
      },
      currentStep: 1 // Stay on current step index for resuming
    });
    router.push('/leads');
  };

  const canProceed = formData.productType && formData.branchCode;

  return (
    <DashboardLayout 
        title="New Lead Application - Step 1" 
        showNotifications={false}
        showExitButton={true} 
        onExit={handleExit} 
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={1} totalSteps={11} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Details</h2>

          <div className="space-y-4">
            
            {/* 1. Product Type Field */}
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

            {/* 2. Branch Code Field */}
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

            {/* 3. Application Type Field */}
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
