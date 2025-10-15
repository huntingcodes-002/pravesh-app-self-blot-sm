'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import { useLead } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Step7Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  const [formData, setFormData] = useState({
    collateralType: currentLead?.formData?.step7?.collateralType || '',
    ownershipType: currentLead?.formData?.step7?.ownershipType || '',
    currency: currentLead?.formData?.step7?.currency || 'INR', // Added Currency
    propertyValue: currentLead?.formData?.step7?.propertyValue || '',
    description: currentLead?.formData?.step7?.description || '',
    location: currentLead?.formData?.step7?.location || '' // Changed to Input field type (string)
  });

  useEffect(() => {
    if (currentLead?.formData?.step7) {
      setFormData(currentLead.formData.step7);
    }
  }, [currentLead]);

  const setField = (key: string, value: string | number) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (!currentLead) return;

    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step7: formData
      },
      currentStep: 8
    });
    router.push('/lead/step8');
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
        step7: formData
      },
      currentStep: 7
    });
    router.push('/leads');
  };

  const handlePrevious = () => {
    router.push('/lead/step6');
  };

  const canProceed = formData.collateralType && formData.ownershipType && formData.propertyValue;

  return (
    <DashboardLayout 
        title="Collateral Details" 
        showNotifications={false}
        showExitButton={true} 
        onExit={handleExit}
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={7} totalSteps={11} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Collateral Information</h2>

            <div className="space-y-4">
              
              {/* 1. Collateral Type */}
              <div>
                <Label htmlFor="collateralType">
                  Collateral Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.collateralType}
                  onValueChange={(value) => setField('collateralType', value)}
                >
                  <SelectTrigger id="collateralType" className="h-12">
                    <SelectValue placeholder="Select collateral type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property">🏠 Property</SelectItem>
                    <SelectItem value="vehicle">🚗 Vehicle</SelectItem>
                    <SelectItem value="gold">💰 Gold</SelectItem>
                    <SelectItem value="fd">💳 Fixed Deposit</SelectItem>
                    <SelectItem value="shares">📈 Shares/Securities</SelectItem>
                    <SelectItem value="machinery">⚙️ Machinery</SelectItem>
                    <SelectItem value="other">📋 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Ownership Type */}
              <div>
                <Label htmlFor="ownershipType">
                  Ownership Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.ownershipType}
                  onValueChange={(value) => setField('ownershipType', value)}
                >
                  <SelectTrigger id="ownershipType" className="h-12">
                    <SelectValue placeholder="Select ownership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="leased">Leased</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Estimated Property Value (with Currency) */}
              <div>
                <Label htmlFor="propertyValue">
                  Estimated Property Value <span className="text-red-500">*</span>
                </Label>
                <div className="flex">
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
                    id="propertyValue"
                    type="number"
                    value={formData.propertyValue}
                    onChange={(e) => setField('propertyValue', e.target.value)}
                    placeholder="Enter estimated value"
                    className="h-12 rounded-l-none"
                    min="1" max="999999999"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter value between ₹1,00,000 to ₹99,99,99,999</p>
              </div>

              {/* 4. Collateral Description */}
              <div>
                <Label htmlFor="description">Collateral Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Enter detailed description of the collateral"
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Provide additional details about the collateral</p>
              </div>

              {/* 5. Location (Changed from Textarea to Input) */}
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setField('location', e.target.value)}
                  placeholder="Enter collateral location"
                  className="h-12"
                />
              </div>

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
