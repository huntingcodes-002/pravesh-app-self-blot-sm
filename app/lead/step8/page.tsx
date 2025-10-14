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

export default function Step8Page() {
  const { currentLead, updateLead } = useLead();
  const router = useRouter();
  const [formData, setFormData] = useState({
    loanAmount: 500000,
    loanPurpose: '',
    productCode: '',
    interestRate: '',
    tenure: '',
    repaymentMode: ''
  });

  useEffect(() => {
    if (currentLead?.formData?.step8) {
      setFormData(currentLead.formData.step8);
    }
  }, [currentLead]);

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

  const handlePrevious = () => {
    router.push('/lead/step7');
  };

  const canProceed = formData.loanAmount >= 50000;

  return (
    <DashboardLayout title="Loan Details" showNotifications={false}>
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={8} />

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Loan Information</h2>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>
                    Loan Amount Requested <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(formData.loanAmount)}</span>
                </div>
                <Slider
                  value={[formData.loanAmount]}
                  onValueChange={(value) => setFormData({ ...formData, loanAmount: value[0] })}
                  min={50000}
                  max={10000000}
                  step={50000}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>₹50K</span>
                  <span>₹1 Cr</span>
                </div>
              </div>

              <div>
                <Label htmlFor="loanPurpose">Loan Purpose</Label>
                <Select
                  value={formData.loanPurpose}
                  onValueChange={(value) => setFormData({ ...formData, loanPurpose: value })}
                >
                  <SelectTrigger id="loanPurpose" className="h-12">
                    <SelectValue placeholder="Select loan purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home-purchase">Home Purchase</SelectItem>
                    <SelectItem value="home-construction">Home Construction</SelectItem>
                    <SelectItem value="business-expansion">Business Expansion</SelectItem>
                    <SelectItem value="working-capital">Working Capital</SelectItem>
                    <SelectItem value="personal">Personal Use</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="productCode">Product Code</Label>
                <Select
                  value={formData.productCode}
                  onValueChange={(value) => setFormData({ ...formData, productCode: value })}
                >
                  <SelectTrigger id="productCode" className="h-12">
                    <SelectValue placeholder="Select product code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HL001">HL001 - Home Loan Standard</SelectItem>
                    <SelectItem value="PL001">PL001 - Personal Loan</SelectItem>
                    <SelectItem value="BL001">BL001 - Business Loan</SelectItem>
                    <SelectItem value="GL001">GL001 - Gold Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interestRate">Interest Rate</Label>
                <Select
                  value={formData.interestRate}
                  onValueChange={(value) => setFormData({ ...formData, interestRate: value })}
                >
                  <SelectTrigger id="interestRate" className="h-12">
                    <SelectValue placeholder="Select interest rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8.5">8.5% p.a.</SelectItem>
                    <SelectItem value="9.0">9.0% p.a.</SelectItem>
                    <SelectItem value="9.5">9.5% p.a.</SelectItem>
                    <SelectItem value="10.0">10.0% p.a.</SelectItem>
                    <SelectItem value="10.5">10.5% p.a.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tenure">Tenure (Months)</Label>
                <Select
                  value={formData.tenure}
                  onValueChange={(value) => setFormData({ ...formData, tenure: value })}
                >
                  <SelectTrigger id="tenure" className="h-12">
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 Months (1 Year)</SelectItem>
                    <SelectItem value="24">24 Months (2 Years)</SelectItem>
                    <SelectItem value="36">36 Months (3 Years)</SelectItem>
                    <SelectItem value="60">60 Months (5 Years)</SelectItem>
                    <SelectItem value="120">120 Months (10 Years)</SelectItem>
                    <SelectItem value="180">180 Months (15 Years)</SelectItem>
                    <SelectItem value="240">240 Months (20 Years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="repaymentMode">Repayment Mode</Label>
                <Select
                  value={formData.repaymentMode}
                  onValueChange={(value) => setFormData({ ...formData, repaymentMode: value })}
                >
                  <SelectTrigger id="repaymentMode" className="h-12">
                    <SelectValue placeholder="Select repayment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emi">EMI (Monthly)</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="bullet">Bullet Payment</SelectItem>
                  </SelectContent>
                </Select>
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
