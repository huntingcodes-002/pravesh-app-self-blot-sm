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
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Address {
  id: string;
  addressType: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  postalCode: string;
  isPrimary: boolean;
}

export default function Step3Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (currentLead?.formData?.step3?.addresses) {
      setAddresses(currentLead.formData.step3.addresses);
    } else {
      setAddresses([
        {
          id: Date.now().toString(),
          addressType: 'residential',
          country: 'India',
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          postalCode: '',
          isPrimary: true,
        },
      ]);
    }
  }, [currentLead]);

  const handleAddAddress = () => {
    setAddresses([
      ...addresses,
      {
        id: Date.now().toString(),
        addressType: 'residential',
        country: 'India',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        postalCode: '',
        isPrimary: addresses.length === 0,
      },
    ]);
  };

  const handleRemoveAddress = (id: string) => {
    const remainingAddresses = addresses.filter((addr) => addr.id !== id);
    if (remainingAddresses.length > 0 && !remainingAddresses.some(a => a.isPrimary)) {
        remainingAddresses[0].isPrimary = true;
    }
    setAddresses(remainingAddresses);
  };

  const handleAddressChange = (id: string, field: keyof Address, value: any) => {
    setAddresses(
      addresses.map((addr) => (addr.id === id ? { ...addr, [field]: value } : addr))
    );
  };

  const handleSetPrimary = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isPrimary: addr.id === id,
      }))
    );
  };

  const handleNext = () => {
    if (!currentLead) return;

    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step3: { addresses },
      },
      currentStep: 4,
    });
    router.push('/lead/step4');
  };

  const handleExit = () => {
    if (!currentLead) {
      router.push('/leads');
      return;
    }
    updateLead(currentLead.id, {
      formData: {
        ...currentLead.formData,
        step3: { addresses },
      },
      currentStep: 3,
    });
    router.push('/leads');
  };

  const handlePrevious = () => {
    router.push('/lead/step2');
  };

  const canProceed = addresses.every(
    (addr) => addr.addressType && addr.country && addr.addressLine1 && addr.postalCode
  );

  return (
    <DashboardLayout
      title="Address Details"
      showNotifications={false}
      showExitButton={true}
      onExit={handleExit}
    >
      <div className="max-w-2xl mx-auto pb-24">
        <ProgressBar currentStep={3} totalSteps={11} totalSteps={10} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-[#003366] mb-6">Address Information</h2>

          <div className="space-y-4">
            {addresses.map((address, index) => (
              <Card key={address.id} className="p-4 border-gray-200">
                <CardContent className="p-0 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-lg text-[#003366]">Address {index + 1}</h3>
                    {addresses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAddress(address.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`addressType-${address.id}`} className="text-sm font-medium text-[#003366] mb-2 block">
                      Address Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={address.addressType}
                      onValueChange={(value) =>
                        handleAddressChange(address.id, 'addressType', value)
                      }
                    >
                      <SelectTrigger id={`addressType-${address.id}`} className="h-12 rounded-lg">
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

                  <div>
                    <Label htmlFor={`country-${address.id}`} className="text-sm font-medium text-[#003366] mb-2 block">Country</Label>
                    <Input
                      id={`country-${address.id}`}
                      type="text"
                      value={address.country}
                      readOnly
                      className="h-12 bg-gray-100 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`addressLine1-${address.id}`} className="text-sm font-medium text-[#003366] mb-2 block">
                      Address Line 1 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`addressLine1-${address.id}`}
                      type="text"
                      value={address.addressLine1}
                      onChange={(e) =>
                        handleAddressChange(address.id, 'addressLine1', e.target.value)
                      }
                      placeholder="House/Flat No., Building Name"
                      className="h-12 rounded-lg"
                      maxLength={255}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`addressLine2-${address.id}`} className="text-sm font-medium text-[#003366] mb-2 block">Address Line 2</Label>
                    <Input
                      id={`addressLine2-${address.id}`}
                      type="text"
                      value={address.addressLine2}
                      onChange={(e) =>
                        handleAddressChange(address.id, 'addressLine2', e.target.value)
                      }
                      placeholder="Street Name, Area"
                      className="h-12 rounded-lg"
                      maxLength={255}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`addressLine3-${address.id}`} className="text-sm font-medium text-[#003366] mb-2 block">Address Line 3</Label>
                    <Input
                      id={`addressLine3-${address.id}`}
                      type="text"
                      value={address.addressLine3}
                      onChange={(e) =>
                        handleAddressChange(address.id, 'addressLine3', e.target.value)
                      }
                      placeholder="Landmark, Additional Info"
                      className="h-12 rounded-lg"
                      maxLength={255}
                    />
                  </div>


                  <div>
                    <Label htmlFor={`postalCode-${address.id}`} className="text-sm font-medium text-[#003366] mb-2 block">
                      Postal Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`postalCode-${address.id}`}
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => handleAddressChange(address.id, 'postalCode', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter postal code / ZIP"
                      className="h-12 rounded-lg"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <Label
                      htmlFor={`mark-primary-${address.id}`}
                      className="text-base font-medium"
                    >
                      Mark as Primary Address
                    </Label>
                    <Switch
                      id={`mark-primary-${address.id}`}
                      checked={address.isPrimary}
                      onCheckedChange={() => handleSetPrimary(address.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full h-12 text-[#0072CE] border-dashed border-[#0072CE]/50 hover:bg-[#E6F0FA] rounded-lg"
                onClick={handleAddAddress}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Another Address
              </Button>
            </div>
          </div>

        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4">
            <div className="flex gap-3 max-w-2xl mx-auto">
                <Button onClick={handlePrevious} variant="outline" className="flex-1 h-12 rounded-lg">
                  Previous
                </Button>
                <Button onClick={handleNext} disabled={!canProceed} className="flex-1 h-12 rounded-lg bg-[#0072CE] hover:bg-[#005a9e]">
                  Next
                </Button>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}