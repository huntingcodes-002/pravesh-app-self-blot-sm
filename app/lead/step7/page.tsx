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
    collateralType: '',
    ownershipType: '',
    propertyValue: '',
    description: '',
    location: ''
  });

  useEffect(() => {
    if (currentLead?.formData?.step7) {
      setFormData(currentLead.formData.step7);
    }
  }, [currentLead]);

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

  const handlePrevious = () => {
    router.push('/lead/step6');
  };

  const canProceed = formData.collateralType && formData.ownershipType && formData.propertyValue;

  return (
    <DashboardLayout title="Collateral Details" showNotifications={false}>
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={7} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Collateral Information</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="collateralType">
                  Collateral Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.collateralType}
                  onValueChange={(value) => setFormData({ ...formData, collateralType: value })}
                >
                  <SelectTrigger id="collateralType" className="h-12">
                    <SelectValue placeholder="Select collateral type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential Property</SelectItem>
                    <SelectItem value="commercial">Commercial Property</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ownershipType">
                  Ownership Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.ownershipType}
                  onValueChange={(value) => setFormData({ ...formData, ownershipType: value })}
                >
                  <SelectTrigger id="ownershipType" className="h-12">
                    <SelectValue placeholder="Select ownership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self Owned</SelectItem>
                    <SelectItem value="joint">Joint Ownership</SelectItem>
                    <SelectItem value="family">Family Owned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="propertyValue">
                  Estimated Property Value (INR) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="propertyValue"
                  type="number"
                  value={formData.propertyValue}
                  onChange={(e) => setFormData({ ...formData, propertyValue: e.target.value })}
                  placeholder="Enter property value"
                  className="h-12"
                />
                <p className="text-xs text-gray-500 mt-1">Typical range: ₹50,000 - ₹10,00,00,000</p>
              </div>

              <div>
                <Label htmlFor="description">Collateral Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the collateral property..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Textarea
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter property location..."
                  className="min-h-[80px]"
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
