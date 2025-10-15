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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';

export default function Step4Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    addressType: currentLead?.formData?.step4?.addressType || 'residential',
    country: currentLead?.formData?.step4?.country || 'India',
    addressLine1: currentLead?.formData?.step4?.addressLine1 || '',
    addressLine2: currentLead?.formData?.step4?.addressLine2 || '',
    addressLine3: currentLead?.formData?.step4?.addressLine3 || '', // NEW FIELD
    postalCode: currentLead?.formData?.step4?.postalCode || '',
    isPrimary: currentLead?.formData?.step4?.isPrimary || true,
  });

  useEffect(() => {
    if (currentLead?.formData?.step4) {
      setFormData(currentLead.formData.step4);
    }
  }, [currentLead]);

  const handleNext = () => {
    if (!currentLead) return;

    const currentAddress = {
        addressType: formData.addressType,
        country: formData.country,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        addressLine3: formData.addressLine3,
        postalCode: formData.postalCode,
        isPrimary: formData.isPrimary
    };

    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step4: currentAddress 
      },
      currentStep: 5
    });
    router.push('/lead/step5');
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
        step4: formData
      },
      currentStep: 4
    });
    router.push('/leads');
  };

  const handlePrevious = () => {
    router.push('/lead/step3');
  };

  const canProceed = formData.addressType && formData.country && formData.addressLine1 && formData.postalCode;

  return (
    <DashboardLayout 
        title="Address Details" 
        showNotifications={false}
        showExitButton={true} 
        onExit={handleExit} 
    >
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={4} totalSteps={11} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Primary Address Information</h2>

          <div className="space-y-4">
            
            {/* 1. Address Type */}
            <div>
              <Label htmlFor="addressType">Address Type <span className="text-red-500">*</span></Label>
              <Select
                value={formData.addressType}
                onValueChange={(value) => setFormData({ ...formData, addressType: value })}
              >
                <SelectTrigger id="addressType" className="h-12">
                  <SelectValue placeholder="Select address type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="additional">Additional</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Country */}
            <div>
              <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              >
                <SelectTrigger id="country" className="h-12">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Singapore">Singapore</SelectItem>
                  <SelectItem value="UAE">UAE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Address Line 1 */}
            <div>
              <Label htmlFor="addressLine1">Address Line 1 <span className="text-red-500">*</span></Label>
              <Input
                id="addressLine1"
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="House/Flat No., Building Name"
                className="h-12"
                maxLength={255}
              />
              <p className="text-xs text-gray-500 mt-1">Max 255 characters</p>
            </div>

            {/* 4. Address Line 2 */}
            <div>
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                placeholder="Street Name, Area"
                className="h-12"
                maxLength={255}
              />
              <p className="text-xs text-gray-500 mt-1">Max 255 characters</p>
            </div>
            
            {/* 5. Address Line 3 (New Field) */}
            <div>
              <Label htmlFor="addressLine3">Address Line 3</Label>
              <Input
                id="addressLine3"
                type="text"
                value={formData.addressLine3}
                onChange={(e) => setFormData({ ...formData, addressLine3: e.target.value })}
                placeholder="Landmark, Additional Info"
                className="h-12"
                maxLength={255}
              />
              <p className="text-xs text-gray-500 mt-1">Max 255 characters</p>
            </div>


            {/* 6. Postal Code */}
            <div>
              <Label htmlFor="postalCode">Postal Code <span className="text-red-500">*</span></Label>
              <Input
                id="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="Enter postal code / ZIP"
                className="h-12"
                maxLength={6}
              />
              <p className="text-xs text-green-600 mt-1">Auto-populated city and state (Mock: Mumbai, MH)</p>
            </div>

            {/* 7. Primary Address Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <Label htmlFor="mark-primary" className="text-base font-medium">
                Mark as Primary Address
              </Label>
              <Switch
                id="mark-primary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">This will be used as your primary contact address</p>


            {/* 8. Add Another Address Button */}
            <div className="pt-4">
                <Button variant="outline" className="w-full h-12 text-blue-600 border-dashed border-blue-200 hover:bg-blue-50">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Address
                </Button>
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
